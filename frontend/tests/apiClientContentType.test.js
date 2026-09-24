import {criarApiClient} from '../services/api/apiClient';

function criarHeaders(contentType) {
    return {
        get: jest.fn((nome) => nome.toLowerCase() === 'content-type' ? contentType : null)
    };
}

test('aceita resposta declarada como JSON', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: criarHeaders('application/json; charset=utf-8'),
        text: async () => JSON.stringify({
            configuracoes: {
                nome: 'Julia'
            }
        })
    });

    const cliente = criarApiClient({
        baseUrl: 'http://api',
        fetchImpl
    });

    await expect(cliente.requisicao({
        caminho: '/users/me'
    })).resolves.toEqual({
        configuracoes: {
            nome: 'Julia'
        }
    });
});

test('rejeita resposta HTML mesmo quando o corpo parece JSON', async () => {
    const lerTexto = jest.fn(async () => JSON.stringify({
        configuracoes: {
            nome: 'Julia'
        }
    }));

    const fetchImpl = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: criarHeaders('text/html; charset=utf-8'),
        text: lerTexto
    });

    const cliente = criarApiClient({
        baseUrl: 'http://api',
        fetchImpl
    });

    await expect(cliente.requisicao({
        caminho: '/users/me'
    })).rejects.toMatchObject({
        status: 200,
        codigo: 'RESPOSTA_INVALIDA',
        mensagemUsuario: 'Não foi possível concluir a solicitação.'
    });

    expect(lerTexto).not.toHaveBeenCalled();
});

test('aceita respostas de erro no formato problem json', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: criarHeaders('application/problem+json'),
        text: async () => JSON.stringify({
            erro: {
                codigo: 'DADOS_INVALIDOS',
                mensagem: 'Os dados informados são inválidos.'
            }
        })
    });

    const cliente = criarApiClient({
        baseUrl: 'http://api',
        fetchImpl
    });

    await expect(cliente.requisicao({
        caminho: '/users/me',
        metodo: 'PATCH'
    })).rejects.toMatchObject({
        message: 'Os dados informados são inválidos.',
        status: 422,
        codigo: 'DADOS_INVALIDOS'
    });
});