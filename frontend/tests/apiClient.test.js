/**
 * Testes de serialização, respostas e normalização de erros do cliente HTTP.
 */
import {
    criarApiClient
} from '../services/api/apiClient';

function criarRespostaJson({
    ok = true,
    status = 200,
    dados = null
} = {}) {
    return {
        ok,
        status,
        text: async () =>
            JSON.stringify(dados)
    };
}

test('envia corpo JSON e retorna os dados da API', async () => {
    const fetchImpl =
        jest.fn().mockResolvedValue(
            criarRespostaJson({
                dados: {
                    autenticacao: {
                        token: 'jwt'
                    }
                }
            })
        );

    const cliente =
        criarApiClient({
            baseUrl: 'http://api',
            fetchImpl
        });

    const corpo = {
        email: 'pessoa@email.com',
        senha: 'segredo'
    };

    const resposta =
        await cliente.requisicao({
            caminho: '/auth/login',
            metodo: 'POST',
            corpo
        });

    expect(
        fetchImpl
    ).toHaveBeenCalledWith(
        'http://api/auth/login',
        expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(corpo)
        })
    );

    expect(
        resposta.autenticacao.token
    ).toBe('jwt');
});

test('envia o token somente pelo cabeçalho de autorização', async () => {
    const fetchImpl =
        jest.fn().mockResolvedValue(
            criarRespostaJson({
                dados: {
                    configuracoes: {}
                }
            })
        );

    const cliente =
        criarApiClient({
            baseUrl: 'http://api',
            fetchImpl
        });

    await cliente.requisicao({
        caminho: '/users/me',
        token: 'token-seguro'
    });

    expect(
        fetchImpl
    ).toHaveBeenCalledWith(
        'http://api/users/me',
        expect.objectContaining({
            headers: expect.objectContaining({
                Authorization:
                    'Bearer token-seguro'
            })
        })
    );
});

test('converte o erro da API em mensagem segura para a interface', async () => {
    const fetchImpl =
        jest.fn().mockResolvedValue(
            criarRespostaJson({
                ok: false,
                status: 401,
                dados: {
                    erro: {
                        codigo:
                            'CREDENCIAIS_INVALIDAS',
                        mensagem:
                            'E-mail ou senha incorretos.'
                    }
                }
            })
        );

    const cliente =
        criarApiClient({
            baseUrl: 'http://api',
            fetchImpl
        });

    await expect(
        cliente.requisicao({
            caminho: '/auth/login'
        })
    ).rejects.toMatchObject({
        message:
            'E-mail ou senha incorretos.',
        status: 401,
        codigo:
            'CREDENCIAIS_INVALIDAS',
        mensagemUsuario:
            'Não foi possível concluir a solicitação.'
    });
});

test('retorna nulo quando a API responde com 204', async () => {
    const resposta = {
        ok: true,
        status: 204,
        text: jest.fn()
    };

    const fetchImpl =
        jest.fn().mockResolvedValue(
            resposta
        );

    const cliente =
        criarApiClient({
            baseUrl: 'http://api',
            fetchImpl
        });

    await expect(
        cliente.requisicao({
            caminho: '/auth/logout',
            metodo: 'POST'
        })
    ).resolves.toBeNull();

    expect(
        resposta.text
    ).not.toHaveBeenCalled();
});

test('normaliza resposta HTML de erro sem expor o conteúdo', async () => {
    const fetchImpl =
        jest.fn().mockResolvedValue({
            ok: false,
            status: 502,
            text: async () =>
                '<html>erro interno do proxy</html>'
        });

    const cliente =
        criarApiClient({
            baseUrl: 'http://api',
            fetchImpl
        });

    await expect(
        cliente.requisicao({
            caminho: '/users/me'
        })
    ).rejects.toMatchObject({
        status: 502,
        codigo: 'RESPOSTA_INVALIDA',
        mensagemUsuario:
            'Não foi possível concluir a solicitação.'
    });
});

test('rejeita resposta de sucesso com corpo vazio', async () => {
    const fetchImpl =
        jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => ''
        });

    const cliente =
        criarApiClient({
            baseUrl: 'http://api',
            fetchImpl
        });

    await expect(
        cliente.requisicao({
            caminho: '/users/me'
        })
    ).rejects.toMatchObject({
        status: 200,
        codigo: 'RESPOSTA_INVALIDA'
    });
});

test('rejeita resposta de sucesso com JSON inválido', async () => {
    const fetchImpl =
        jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: async () =>
                '{"configuracoes":'
        });

    const cliente =
        criarApiClient({
            baseUrl: 'http://api',
            fetchImpl
        });

    await expect(
        cliente.requisicao({
            caminho: '/users/me'
        })
    ).rejects.toMatchObject({
        status: 200,
        codigo: 'RESPOSTA_INVALIDA',
        mensagemUsuario:
            'Não foi possível concluir a solicitação.'
    });
});

test('mantém compatibilidade com mocks que fornecem somente json', async () => {
    const fetchImpl =
        jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                configuracoes: {
                    nome: 'Julia'
                }
            })
        });

    const cliente =
        criarApiClient({
            baseUrl: 'http://api',
            fetchImpl
        });

    await expect(
        cliente.requisicao({
            caminho: '/users/me'
        })
    ).resolves.toEqual({
        configuracoes: {
            nome: 'Julia'
        }
    });
});