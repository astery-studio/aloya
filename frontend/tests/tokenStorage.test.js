/**
 * Testes da persistência, leitura e descarte de sessões autenticadas.
 */
import * as storage from '../services/storage/secureStorage';
import { obterToken, removerToken, salvarToken } from '../services/auth/tokenStorage';

jest.mock('../services/storage/secureStorage');

beforeEach(() => jest.clearAllMocks());

test('persiste e recupera as informações da sessão', async () => {
    storage.lerSeguro.mockResolvedValue('{"token":"jwt","tipo":"Bearer"}');
    await salvarToken({ token: 'jwt', tipo: 'Bearer' });
    expect(storage.salvarSeguro).toHaveBeenCalledWith(
        'aloya.auth.session', '{"token":"jwt","tipo":"Bearer"}'
    );
    await expect(obterToken()).resolves.toEqual({ token: 'jwt', tipo: 'Bearer' });
});

test('remove sessão ausente ou corrompida com segurança', async () => {
    storage.lerSeguro.mockResolvedValue(null);
    await expect(obterToken()).resolves.toBeNull();
    storage.lerSeguro.mockResolvedValue('{inválido');
    await expect(obterToken()).resolves.toBeNull();
    expect(storage.removerSeguro).toHaveBeenCalledWith('aloya.auth.session');
    await removerToken();
    expect(storage.removerSeguro).toHaveBeenCalledTimes(2);
});

test('rejeita token vazio', async () => {
    await expect(salvarToken({ token: ' ' })).rejects.toThrow('inválido');
});
