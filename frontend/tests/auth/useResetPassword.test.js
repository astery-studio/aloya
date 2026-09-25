/**
 * Testes dos estados, validações e ações do hook de redefinição de senha.
 */
import {
    act,
    renderHook
} from '@testing-library/react-native';

import {
    useResetPassword
} from '../../features/auth/hooks/useResetPassword';

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

    test('não expõe a mensagem interna quando não existe mensagem segura', async () => {
        const redefinirSenha = jest.fn().mockRejectedValue(
            new Error('Token inválido.')
        )

        const {result} = await renderHook(() =>
            useResetPassword({
                redefinirSenha,
                token: 'token-invalido'
            })
        )

        await preencherSenhas(result)

        await act(async () => {
            await result.current.enviar()
        })

        expect(result.current).toMatchObject({
            carregando: false,
            erro: 'Não foi possível redefinir a senha.',
            sucesso: false
        })
    })

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

    test('rejeita senha menor que oito caracteres', async () => {
        const redefinirSenha = jest.fn()
        const {result} = await renderHook(() => useResetPassword({redefinirSenha, token: 'token-valido'}))

        await act(() => {
            result.current.setSenha('Curta12')
            result.current.setConfirmacao('Curta12')
        })

        await act(async () => {
            await result.current.enviar()
        })

        expect(redefinirSenha).not.toHaveBeenCalled()
        expect(result.current.erro).toBe('A senha deve possuir pelo menos 8 caracteres.')
    })

    test('rejeita senha maior que setenta e dois bytes', async () => {
        const redefinirSenha = jest.fn()
        const senhaGrande = 'á'.repeat(37)
        const {result} = await renderHook(() => useResetPassword({redefinirSenha, token: 'token-valido'}))

        await act(() => {
            result.current.setSenha(senhaGrande)
            result.current.setConfirmacao(senhaGrande)
        })

        await act(async () => {
            await result.current.enviar()
        })

        expect(redefinirSenha).not.toHaveBeenCalled()
        expect(result.current.erro).toBe('A senha ultrapassa o tamanho máximo permitido.')
    })

    test('impede duas redefinições simultâneas', async () => {
        let concluir
        const redefinirSenha = jest.fn(() => new Promise(resolve => {
            concluir = resolve
        }))

        const {result} = await renderHook(() => useResetPassword({redefinirSenha, token: 'token-valido'}))

        await preencherSenhas(result)

        let primeira
        let segunda

        await act(async () => {
            primeira = result.current.enviar()
            segunda = result.current.enviar()
        })

        expect(redefinirSenha).toHaveBeenCalledTimes(1)

        await act(async () => {
            concluir({mensagem: 'Senha redefinida.'})
            await primeira
            await segunda
        })
    })
});