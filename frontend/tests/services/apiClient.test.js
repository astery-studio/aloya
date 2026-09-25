/**
 * Testes de serialização, respostas e normalização de erros do cliente HTTP.
 */
import { criarApiClient } from '../../services/api/apiClient';

test('envia corpo JSON e retorna os dados da API', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => ({ autenticacao: { token: 'jwt' } })
    });
    const cliente = criarApiClient({ baseUrl: 'http://api', fetchImpl });
    const corpo = { email: 'pessoa@email.com', senha: 'segredo' };
    const resposta = await cliente.requisicao({ caminho: '/auth/login', metodo: 'POST', corpo });
    expect(fetchImpl).toHaveBeenCalledWith('http://api/auth/login', expect.objectContaining({
        method: 'POST', body: JSON.stringify(corpo)
    }));
    expect(resposta.autenticacao.token).toBe('jwt');
});

test('converte o erro da API em mensagem segura para a interface', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
        ok: false, status: 401,
        json: async () => ({ erro: { codigo: 'CREDENCIAIS_INVALIDAS',
            mensagem: 'E-mail ou senha incorretos.' } })
    });
    const cliente = criarApiClient({ baseUrl: 'http://api', fetchImpl });
    await expect(cliente.requisicao({ caminho: '/auth/login' })).rejects.toMatchObject({
        status: 401, codigo: 'CREDENCIAIS_INVALIDAS',
        mensagemUsuario: 'E-mail ou senha incorretos.'
    });
});

test('interrompe uma requisição que ultrapassa o tempo limite', async () => {
    const fetchImpl = jest.fn((url, opcoes) => new Promise((resolve, reject) => {
        opcoes.signal.addEventListener('abort', () => {
            const erro = new Error('cancelada');
            erro.name = 'AbortError';
            reject(erro);
        });
    }));
    const cliente = criarApiClient({ baseUrl: 'http://api', fetchImpl, timeoutMs: 1 });
    await expect(cliente.requisicao({ caminho: '/auth/login' })).rejects.toMatchObject({
        mensagemUsuario: 'A API não respondeu dentro do tempo esperado.'
    });
});

test('envia token sem serializar corpo ausente e aceita resposta vazia', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true, status: 204 });
    const cliente = criarApiClient({ baseUrl: 'http://api', fetchImpl });

    await expect(cliente.requisicao({
        caminho: '/sessao', token: 'jwt'
    })).resolves.toBeNull();
    expect(fetchImpl).toHaveBeenCalledWith('http://api/sessao', expect.objectContaining({
        method: 'GET', headers: expect.objectContaining({ Authorization: 'Bearer jwt' })
    }));
    expect(fetchImpl.mock.calls[0][1]).not.toHaveProperty('body');
});

test('normaliza falha de rede sem vazar o erro técnico', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('detalhe de conexão'));
    const cliente = criarApiClient({ baseUrl: 'http://api', fetchImpl });

    await expect(cliente.requisicao({ caminho: '/auth' })).rejects.toMatchObject({
        mensagemUsuario: 'Não foi possível conectar ao servidor.'
    });
});

test('usa mensagem genérica quando a API não fornece detalhes', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
        ok: false, status: 500, json: async () => ({})
    });
    const cliente = criarApiClient({ baseUrl: 'http://api', fetchImpl });

    await expect(cliente.requisicao({ caminho: '/auth' })).rejects.toMatchObject({
        status: 500,
        mensagemUsuario: 'Não foi possível concluir a solicitação.',
        codigo: undefined,
        detalhes: undefined
    });
});

test('usa o fetch global quando uma implementação não é informada', async () => {
    const fetchOriginal = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => ({ ativo: true })
    });
    try {
        const cliente = criarApiClient({ baseUrl: 'http://api' });
        await expect(cliente.requisicao({ caminho: '/status' }))
            .resolves.toEqual({ ativo: true });
        expect(global.fetch).toHaveBeenCalledTimes(1);
    } finally {
        global.fetch = fetchOriginal;
    }
});
