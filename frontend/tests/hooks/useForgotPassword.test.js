/**
 * Testes dos estados e ações do hook de recuperação de senha.
 */
import { act, renderHook } from '@testing-library/react-native';
import { useForgotPassword } from '../../features/auth/hooks/useForgotPassword';

test('normaliza o e-mail e guarda o resultado do envio', async () => {
    const resposta = { mensagem: 'E-mail enviado.' };
    const solicitarRecuperacao = jest.fn().mockResolvedValue(resposta);
    const { result } = await renderHook(() =>
        useForgotPassword({ solicitarRecuperacao })
    );

    await act(() => result.current.setEmail(' PESSOA@EMAIL.COM '));
    await act(async () => result.current.enviar());

    expect(solicitarRecuperacao).toHaveBeenCalledWith({ email: 'pessoa@email.com' });
    expect(result.current).toMatchObject({ carregando: false, erro: null, resultado: resposta });
});

test('reenvia pelo serviço específico e expõe falhas', async () => {
    const falha = new Error('Aguarde antes de tentar novamente.');
    const solicitarRecuperacao = jest.fn();
    const reenviarRecuperacao = jest.fn().mockRejectedValue(falha);
    const { result } = await renderHook(() =>
        useForgotPassword({ solicitarRecuperacao, reenviarRecuperacao })
    );

    await act(() => result.current.setEmail('pessoa@email.com'));
    await act(async () => result.current.reenviar());

    expect(reenviarRecuperacao).toHaveBeenCalledWith({ email: 'pessoa@email.com' });
    expect(result.current.erro).toBe(falha.message);
    expect(result.current.carregando).toBe(false);
});

test('reenvia pelo serviço original quando não há serviço específico', async () => {
    const solicitarRecuperacao = jest.fn().mockResolvedValue({ mensagem: 'ok' });
    const { result } = await renderHook(() =>
        useForgotPassword({ solicitarRecuperacao })
    );

    await act(() => result.current.setEmail('pessoa@email.com'));
    await act(async () => result.current.reenviar());
    await act(() => result.current.limparErro());

    expect(solicitarRecuperacao).toHaveBeenCalledWith({ email: 'pessoa@email.com' });
    expect(result.current.erro).toBeNull();
});

test.each([
    [{ mensagemUsuario: 'Mensagem pública.' }, 'Mensagem pública.'],
    [{}, 'Não foi possível enviar o e-mail.']
])('prioriza mensagens seguras de recuperação', async (falha, mensagem) => {
    const solicitarRecuperacao = jest.fn().mockRejectedValue(falha);
    const { result } = await renderHook(() =>
        useForgotPassword({ solicitarRecuperacao })
    );

    await act(async () => result.current.enviar());

    expect(result.current.erro).toBe(mensagem);
});
