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
