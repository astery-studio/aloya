import { criarAuthService } from '../features/auth/services/authService';

test('encaminha cadastro e login aos endpoints reais', async () => {
    const requisicao = jest.fn().mockResolvedValue({ ok: true });
    const service = criarAuthService({ requisicao });
    await service.cadastrar({ nome: 'Carla' });
    await service.realizarLogin({ email: 'carla@email.com', senha: 'segredo' });
    expect(requisicao).toHaveBeenNthCalledWith(1, {
        metodo: 'POST', caminho: '/auth/register', corpo: { nome: 'Carla' }
    });
    expect(requisicao).toHaveBeenNthCalledWith(2, {
        metodo: 'POST', caminho: '/auth/login',
        corpo: { email: 'carla@email.com', senha: 'segredo' }
    });
});
