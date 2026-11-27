//Testa a inclusão segura do token e a limpeza de sessões inválidas nas requisições privadas.
import { criarRequisicaoAutenticada } from '../../src/shared/services/api/authenticatedRequest';

test('encerra leitura da sessão travada sem enviar a requisição nem usar resposta tardia', async () => {
    jest.useFakeTimers();
    try {
        let liberar;
        const dependencias = criarDependencias();
        dependencias.obterCredencial.mockReturnValue(
            new Promise((resolve) => {
                liberar = resolve;
            })
        );
        const requisicao = criarRequisicaoAutenticada({ ...dependencias, timeoutMs: 1000 });
        const resultado = expect(
            requisicao({ caminho: '/api/diario/registros' })
        ).rejects.toMatchObject({
            codigo: 'TEMPO_ARMAZENAMENTO_ESGOTADO',
            mensagemUsuario: 'Não foi possível acessar sua sessão. Tente novamente.'
        });
        await jest.advanceTimersByTimeAsync(1000);
        await resultado;
        liberar({ token: 'resposta-tardia' });
        await Promise.resolve();
        expect(dependencias.requisicao).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
        dependencias.obterCredencial.mockResolvedValue({ token: 'nova-sessao' });
        await expect(requisicao({ caminho: '/api/diario/registros' })).resolves.toEqual({
            sucesso: true
        });
    } finally {
        jest.useRealTimers();
    }
});

test('cancela imediatamente mesmo quando a leitura da sessão não responde', async () => {
    jest.useFakeTimers();
    try {
        const dependencias = criarDependencias();
        dependencias.obterCredencial.mockReturnValue(new Promise(() => {}));
        const controle = new AbortController();
        const resultado = expect(
            criarRequisicaoAutenticada(dependencias)({
                caminho: '/api/diario/catalogo',
                signal: controle.signal
            })
        ).rejects.toMatchObject({ name: 'AbortError' });
        controle.abort();
        await resultado;
        expect(dependencias.requisicao).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
    } finally {
        jest.useRealTimers();
    }
});

test.each(['ausente', 'expirada'])(
    'não fica carregando se a limpeza da sessão %s travar',
    async (estado) => {
        jest.useFakeTimers();
        try {
            const dependencias = criarDependencias(estado === 'ausente' ? { sessao: null } : {});
            if (estado === 'expirada')
                dependencias.requisicao.mockRejectedValue({
                    status: 401,
                    codigo: 'TOKEN_INVALIDO'
                });
            dependencias.removerCredencial.mockReturnValue(new Promise(() => {}));
            const resultado = expect(
                criarRequisicaoAutenticada({ ...dependencias, timeoutMs: 1000 })({
                    caminho: '/api/diario/registros'
                })
            ).rejects.toMatchObject({ status: 401 });
            await jest.advanceTimersByTimeAsync(1000);
            await resultado;
            expect(jest.getTimerCount()).toBe(0);
        } finally {
            jest.useRealTimers();
        }
    }
);

test('não envia operação expirada enquanto aguardava a sessão segura', async () => {
    let liberar;
    const controle = new AbortController();
    const dependencias = criarDependencias();
    dependencias.obterCredencial.mockReturnValue(
        new Promise((resolve) => {
            liberar = resolve;
        })
    );
    const resultado = criarRequisicaoAutenticada(dependencias)({
        caminho: '/categoria',
        signal: controle.signal
    });
    controle.abort();
    liberar({ token: 'teste' });
    await expect(resultado).rejects.toMatchObject({ name: 'AbortError' });
    expect(dependencias.requisicao).not.toHaveBeenCalled();
});

test('impede que uma operação pendente use credencial de outra conta', async () => {
    const dependencias = criarDependencias();
    const requisicao = criarRequisicaoAutenticada(dependencias);
    await expect(
        requisicao({ caminho: '/privado', validarCredencial: () => false })
    ).rejects.toMatchObject({ status: 401 });
    expect(dependencias.requisicao).not.toHaveBeenCalled();
    expect(dependencias.removerCredencial).not.toHaveBeenCalled();
    await requisicao({ caminho: '/privado', validarCredencial: () => true });
    expect(dependencias.requisicao).toHaveBeenCalledWith({
        caminho: '/privado',
        token: 'token-seguro'
    });
});

function criarDependencias(opcoes = {}) {
    const sessao = Object.hasOwn(opcoes, 'sessao')
        ? opcoes.sessao
        : {
              token: 'token-seguro'
          };
    const resposta = Object.hasOwn(opcoes, 'resposta')
        ? opcoes.resposta
        : {
              sucesso: true
          };

    return {
        requisicao: jest.fn().mockResolvedValue(resposta),
        obterCredencial: jest.fn().mockResolvedValue(sessao),
        removerCredencial: jest.fn().mockResolvedValue(undefined)
    };
}

test.each([
    {
        requisicao: null,
        obterCredencial: jest.fn(),
        removerCredencial: jest.fn()
    },
    {
        requisicao: jest.fn(),
        obterCredencial: null,
        removerCredencial: jest.fn()
    },
    {
        requisicao: jest.fn(),
        obterCredencial: jest.fn(),
        removerCredencial: null
    }
])('rejeita dependências obrigatórias inválidas', (dependencias) => {
    expect(() => criarRequisicaoAutenticada(dependencias)).toThrow(
        'Não foi possível configurar as requisições autenticadas.'
    );
});

test.each([
    null,
    undefined,
    {},
    {
        token: null
    },
    {
        token: 123
    },
    {
        token: ''
    },
    {
        token: '   '
    }
])('rejeita uma sessão sem token válido: %p', async (sessao) => {
    const dependencias = criarDependencias({
        sessao
    });
    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias);

    await expect(
        requisicaoAutenticada({
            caminho: '/api/anticoncepcionais'
        })
    ).rejects.toMatchObject({
        status: 401,
        codigo: 'SESSAO_AUSENTE',
        mensagemUsuario: 'Sua sessão expirou. Entre novamente.'
    });

    expect(dependencias.removerCredencial).toHaveBeenCalledTimes(1);
    expect(dependencias.requisicao).not.toHaveBeenCalled();
});

test('ignora falha ao limpar uma sessão local sem token', async () => {
    const dependencias = criarDependencias({
        sessao: null
    });
    dependencias.removerCredencial.mockRejectedValue(new Error('falha interna do armazenamento'));

    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias);

    await expect(
        requisicaoAutenticada({
            caminho: '/api/anticoncepcionais'
        })
    ).rejects.toMatchObject({
        status: 401,
        codigo: 'SESSAO_AUSENTE'
    });

    expect(dependencias.requisicao).not.toHaveBeenCalled();
});

test('envia somente o token obtido do armazenamento seguro', async () => {
    const dependencias = criarDependencias();
    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias);
    const controlador = new AbortController();
    const corpo = {
        nome: 'Anticoncepcional atualizado'
    };

    await expect(
        requisicaoAutenticada({
            metodo: 'PUT',
            caminho: '/api/anticoncepcionais/7',
            corpo,
            signal: controlador.signal,
            token: 'token-injetado'
        })
    ).resolves.toEqual({
        sucesso: true
    });

    expect(dependencias.requisicao).toHaveBeenCalledTimes(1);
    expect(dependencias.requisicao).toHaveBeenCalledWith({
        metodo: 'PUT',
        caminho: '/api/anticoncepcionais/7',
        corpo,
        signal: controlador.signal,
        token: 'token-seguro'
    });
    expect(dependencias.obterCredencial).toHaveBeenCalledTimes(1);
    expect(dependencias.removerCredencial).not.toHaveBeenCalled();
});

test('aceita chamada sem objeto de opções', async () => {
    const dependencias = criarDependencias();
    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias);

    await expect(requisicaoAutenticada()).resolves.toEqual({
        sucesso: true
    });

    expect(dependencias.requisicao).toHaveBeenCalledWith({
        token: 'token-seguro'
    });
});

test.each(['NAO_AUTENTICADO', 'TOKEN_INVALIDO', 'SESSAO_INVALIDA'])(
    'remove a credencial quando a API rejeita a sessão com %s',
    async (codigo) => {
        const dependencias = criarDependencias();
        const erroSessao = new Error('Sessão inválida.');
        erroSessao.status = 401;
        erroSessao.codigo = codigo;
        dependencias.requisicao.mockRejectedValue(erroSessao);

        const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias);

        await expect(
            requisicaoAutenticada({
                caminho: '/api/anticoncepcionais'
            })
        ).rejects.toBe(erroSessao);

        expect(dependencias.removerCredencial).toHaveBeenCalledTimes(1);
    }
);

test('preserva o erro original quando a limpeza da sessão inválida falha', async () => {
    const dependencias = criarDependencias();
    const erroSessao = new Error('Sessão inválida.');
    erroSessao.status = 401;
    erroSessao.codigo = 'SESSAO_INVALIDA';
    dependencias.requisicao.mockRejectedValue(erroSessao);
    dependencias.removerCredencial.mockRejectedValue(new Error('falha interna do armazenamento'));

    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias);

    await expect(
        requisicaoAutenticada({
            caminho: '/api/anticoncepcionais'
        })
    ).rejects.toBe(erroSessao);

    expect(dependencias.removerCredencial).toHaveBeenCalledTimes(1);
});

test.each([
    {
        status: 401,
        codigo: 'ERRO_DESCONHECIDO'
    },
    {
        status: 403,
        codigo: 'SESSAO_INVALIDA'
    },
    {
        status: 500,
        codigo: 'ERRO_INTERNO'
    }
])(
    'não remove a credencial para um erro que não invalida a sessão: %p',
    async ({ status, codigo }) => {
        const dependencias = criarDependencias();
        const erro = new Error('Falha controlada.');
        erro.status = status;
        erro.codigo = codigo;
        dependencias.requisicao.mockRejectedValue(erro);

        const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias);

        await expect(
            requisicaoAutenticada({
                caminho: '/api/anticoncepcionais'
            })
        ).rejects.toBe(erro);

        expect(dependencias.removerCredencial).not.toHaveBeenCalled();
    }
);

test('preserva falhas que não são objetos Error', async () => {
    const dependencias = criarDependencias();
    dependencias.requisicao.mockRejectedValue('falha desconhecida');

    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias);

    await expect(
        requisicaoAutenticada({
            caminho: '/api/anticoncepcionais'
        })
    ).rejects.toBe('falha desconhecida');

    expect(dependencias.removerCredencial).not.toHaveBeenCalled();
});
