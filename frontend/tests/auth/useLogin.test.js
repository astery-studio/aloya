/**
 * Testes dos estados de sucesso e falha do hook de login.
 */
import { act, renderHook } from '@testing-library/react-native';
import { salvarToken } from '../../services/auth/tokenStorage';
import { useLogin } from '../../features/auth/hooks/useLogin';

jest.mock('../../services/auth/tokenStorage');

beforeEach(() => jest.clearAllMocks());

test('envia login, salva o token e informa sucesso', async () => {
    const resultado = { autenticacao: { token: 'jwt', tipo: 'Bearer' } };
    const realizarLogin = jest.fn().mockResolvedValue(resultado);
    const { result } = await renderHook(() => useLogin({ realizarLogin }));

    let retorno;
    await act(async () => {
        retorno = await result.current.enviarLogin({ email: 'a@b.com', senha: '123' });
    });

    expect(realizarLogin).toHaveBeenCalledWith({ email: 'a@b.com', senha: '123' });
    expect(salvarToken).toHaveBeenCalledWith(resultado.autenticacao);
    expect(result.current).toMatchObject({ carregando: false, erro: null, sucesso: true });
    expect(retorno).toBe(resultado);
});

test('expõe uma mensagem segura quando o login falha', async () => {
    const realizarLogin = jest.fn().mockRejectedValue(new Error('Credenciais inválidas.'));
    const { result } = await renderHook(() => useLogin({ realizarLogin }));
    await act(async () => result.current.enviarLogin({}));
    expect(result.current).toMatchObject({ carregando: false, sucesso: false });
    expect(result.current.erro).toBe('Credenciais inválidas.');
    expect(salvarToken).not.toHaveBeenCalled();

    await act(() => result.current.limparErro());
    expect(result.current.erro).toBeNull();
});
