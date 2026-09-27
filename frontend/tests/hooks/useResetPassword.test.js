import { act, renderHook } from '@testing-library/react-native';
import { useResetPassword } from '../../features/auth/hooks/useResetPassword';

test('não envia senhas vazias ou diferentes', async () => {
    const redefinirSenha = jest.fn();
    const { result } = await renderHook(() =>
        useResetPassword({ redefinirSenha, token: 'token' })
    );
    await expect(result.current.enviar()).resolves.toBeNull();
    expect(redefinirSenha).not.toHaveBeenCalled();
});

test('redefine senha válida e informa sucesso', async () => {
    const redefinirSenha = jest.fn().mockResolvedValue({ mensagem: 'ok' });
    const { result } = await renderHook(() =>
        useResetPassword({ redefinirSenha, token: 'token' })
    );
    await act(() => result.current.setSenha('segura123'));
    await act(() => result.current.setConfirmacao('segura123'));
    await act(async () => result.current.enviar());
    expect(redefinirSenha).toHaveBeenCalledWith({ token: 'token', senha: 'segura123' });
    expect(result.current).toMatchObject({ sucesso: true, carregando: false });
});

test.each([
    [{ mensagemUsuario: 'Mensagem pública' }, 'Mensagem pública'],
    [new Error('Falha conhecida'), 'Falha conhecida'],
    [{}, 'Não foi possível redefinir a senha.']
])('expõe erro seguro e permite limpá-lo', async (falha, mensagem) => {
    const redefinirSenha = jest.fn().mockRejectedValue(falha);
    const { result } = await renderHook(() =>
        useResetPassword({ redefinirSenha, token: 'token' })
    );
    await act(() => result.current.setSenha('segura123'));
    await act(() => result.current.setConfirmacao('segura123'));
    await act(async () => result.current.enviar());
    expect(result.current.erro).toBe(mensagem);
    await act(() => result.current.limparErro());
    expect(result.current.erro).toBeNull();
});
