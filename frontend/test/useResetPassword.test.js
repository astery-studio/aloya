/**
 * Testes dos estados, validações e ações do hook de redefinição de senha.
 */
import {
    act,
    renderHook
} from '@testing-library/react-native';

import {
    useResetPassword
} from '../features/auth/hooks/useResetPassword';

async function preencherSenhas(
    result,
    senha = 'Senha@123',
    confirmacao = 'Senha@123'
) {
    await act(() => {
        result.current.setSenha(senha);
        result.current.setConfirmacao(confirmacao);
    });
}

describe('useResetPassword', () => {
    test('começa com os estados vazios e não envia uma senha inválida', async () => {
        const redefinirSenha = jest.fn();

        const { result } = await renderHook(() =>
            useResetPassword({
                redefinirSenha,
                token: 'token-valido'
            })
        );

        expect(result.current).toMatchObject({
            senha: '',
            confirmacao: '',
            valido: false,
            carregando: false,
            erro: null,
            sucesso: false
        });

        let retorno;

        await act(async () => {
            retorno = await result.current.enviar();
        });

        expect(retorno).toBeNull();
        expect(redefinirSenha).not.toHaveBeenCalled();
        expect(result.current.carregando).toBe(false);
    });

    test('não envia quando a confirmação é diferente da senha', async () => {
        const redefinirSenha = jest.fn();

        const { result } = await renderHook(() =>
            useResetPassword({
                redefinirSenha,
                token: 'token-valido'
            })
        );

        await preencherSenhas(
            result,
            'Senha@123',
            'OutraSenha@123'
        );

        expect(result.current.valido).toBe(false);

        let retorno;

        await act(async () => {
            retorno = await result.current.enviar();
        });

        expect(retorno).toBeNull();
        expect(redefinirSenha).not.toHaveBeenCalled();
    });

    test('envia o token e a senha quando os campos são válidos', async () => {
        const resposta = {
            mensagem: 'Senha redefinida com sucesso.'
        };

        const redefinirSenha = jest.fn()
            .mockResolvedValue(resposta);

        const { result } = await renderHook(() =>
            useResetPassword({
                redefinirSenha,
                token: 'token-valido'
            })
        );

        await preencherSenhas(result);

        expect(result.current.valido).toBe(true);

        let retorno;

        await act(async () => {
            retorno = await result.current.enviar();
        });

        expect(redefinirSenha).toHaveBeenCalledTimes(1);
        expect(redefinirSenha).toHaveBeenCalledWith({
            token: 'token-valido',
            senha: 'Senha@123'
        });

        expect(retorno).toBe(resposta);

        expect(result.current).toMatchObject({
            carregando: false,
            erro: null,
            sucesso: true
        });
    });

    test('mostra a mensagem segura informada pelo serviço', async () => {
        const redefinirSenha = jest.fn().mockRejectedValue({
            mensagemUsuario: 'O link de redefinição expirou.',
            message: 'Erro interno que não deve aparecer.'
        });

        const { result } = await renderHook(() =>
            useResetPassword({
                redefinirSenha,
                token: 'token-expirado'
            })
        );

        await preencherSenhas(result);

        let retorno;

        await act(async () => {
            retorno = await result.current.enviar();
        });

        expect(retorno).toBeNull();

        expect(result.current).toMatchObject({
            carregando: false,
            erro: 'O link de redefinição expirou.',
            sucesso: false
        });
    });

    test('usa a mensagem do erro quando não existe mensagem segura', async () => {
        const redefinirSenha = jest.fn().mockRejectedValue(
            new Error('Token inválido.')
        );

        const { result } = await renderHook(() =>
            useResetPassword({
                redefinirSenha,
                token: 'token-invalido'
            })
        );

        await preencherSenhas(result);

        await act(async () => {
            await result.current.enviar();
        });

        expect(result.current).toMatchObject({
            carregando: false,
            erro: 'Token inválido.',
            sucesso: false
        });
    });

    test('usa a mensagem padrão e permite limpar o erro', async () => {
        const redefinirSenha = jest.fn()
            .mockRejectedValue({});

        const { result } = await renderHook(() =>
            useResetPassword({
                redefinirSenha,
                token: 'token-invalido'
            })
        );

        await preencherSenhas(result);

        await act(async () => {
            await result.current.enviar();
        });

        expect(result.current.erro).toBe(
            'Não foi possível redefinir a senha.'
        );

        await act(() => {
            result.current.limparErro();
        });

        expect(result.current.erro).toBeNull();
    });
});