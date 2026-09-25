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
