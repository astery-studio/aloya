//Testa a validação da senha antes da confirmação e da exclusão da conta.
import {
    fireEvent,
    render,
    screen,
    waitFor
} from '@testing-library/react-native'

jest.mock('../../components/icons/AppIcons', () => ({
    LockKeyIcon: jest.fn(() => null),
    TrashIcon: jest.fn(() => null),
    WarningCircleIcon: jest.fn(() => null)
}))

import { DeleteAccount } from '../../features/settings/account/DeleteAccount'

function criarProps(
    substituicoes = {}
) {
    return {
        visivel: true,
        onFechar: jest.fn(),
        confirmarSenhaExclusao:
            jest.fn().mockResolvedValue(
                true
            ),
        excluirConta:
            jest.fn().mockResolvedValue({
                mensagem:
                    'Conta excluída.'
            }),
        onContaExcluida: jest.fn(),
        ...substituicoes
    }
}

async function preencherSenha(
    senha = 'senha-segura'
) {
    await fireEvent.changeText(
        screen.getByLabelText(
            'Senha atual'
        ),
        senha
    )
}

async function continuarComSenha(
    senha = 'senha-segura'
) {
    await preencherSenha(senha)

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Continuar'
        })
    )
}

async function abrirConfirmacao(
    senha = 'senha-segura'
) {
    await continuarComSenha(senha)

    await waitFor(() => {
        expect(
            screen.getByRole('header', {
                name:
                    'Excluir conta permanentemente?'
            })
        ).toBeOnTheScreen()
    })
}

describe('DeleteAccount', () => {
    test('não mostra o fluxo quando está oculto', async () => {
        const props = criarProps({
            visivel: false
        })

        await render(
            <DeleteAccount {...props} />
        )

        expect(
            screen.queryByText(
                'Confirme sua identidade'
            )
        ).toBeNull()

        expect(
            screen.queryByText(
                'Excluir conta permanentemente?'
            )
        ).toBeNull()
    })

    test('começa solicitando a senha atual', async () => {
        const props = criarProps()

        await render(
            <DeleteAccount {...props} />
        )

        expect(
            screen.getByRole('header', {
                name:
                    'Confirme sua identidade'
            })
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Por segurança, insira sua senha atual para continuar com a exclusão da conta.'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByLabelText(
                'Senha atual'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByRole('button', {
                name: 'Continuar'
            })
        ).toBeDisabled()
    })

    test('fecha o fluxo pelo botão Cancelar', async () => {
        const props = criarProps()

        await render(
            <DeleteAccount {...props} />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Cancelar'
            })
        )

        expect(
            props.onFechar
        ).toHaveBeenCalledTimes(1)

        expect(
            props.confirmarSenhaExclusao
        ).not.toHaveBeenCalled()
    })

    test('não continua sem receber a função de validação', async () => {
        const props = criarProps({
            confirmarSenhaExclusao:
                undefined
        })

        await render(
            <DeleteAccount {...props} />
        )

        await continuarComSenha()

        expect(
            screen.getByRole('header', {
                name:
                    'Confirme sua identidade'
            })
        ).toBeOnTheScreen()

        expect(
            screen.queryByText(
                'Excluir conta permanentemente?'
            )
        ).toBeNull()

        expect(
            props.excluirConta
        ).not.toHaveBeenCalled()
    })

    test('senha incorreta permanece no primeiro modal', async () => {
        const erro =
            new Error('Senha incorreta')

        erro.codigo =
            'SENHA_ATUAL_INCORRETA'

        const props = criarProps({
            confirmarSenhaExclusao:
                jest.fn().mockRejectedValue(
                    erro
                )
        })

        await render(
            <DeleteAccount {...props} />
        )

        await continuarComSenha(
            'senha errada'
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'A senha atual está incorreta.'
                )
            ).toBeOnTheScreen()
        })

        expect(
            screen.queryByText(
                'Excluir conta permanentemente?'
            )
        ).toBeNull()

        expect(
            props.excluirConta
        ).not.toHaveBeenCalled()

        await preencherSenha(
            'senha corrigida'
        )

        expect(
            screen.queryByText(
                'A senha atual está incorreta.'
            )
        ).toBeNull()
    })

    test('senha correta abre a confirmação antes da exclusão', async () => {
        const props = criarProps()

        await render(
            <DeleteAccount {...props} />
        )

        await abrirConfirmacao(
            'senha correta'
        )

        expect(
            screen.getByText(
                'Esta ação é permanente e removerá todos os seus dados de ciclo, diário, anticoncepcionais e rede de apoio.'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Deseja continuar?'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByRole('button', {
                name:
                    'Excluir permanentemente'
            })
        ).toBeEnabled()

        expect(
            screen.getByRole('button', {
                name: 'Cancelar'
            })
        ).toBeEnabled()

        expect(
            props.excluirConta
        ).not.toHaveBeenCalled()
    })

    test('permite repetir a validação depois de erro interno', async () => {
        const props = criarProps({
            confirmarSenhaExclusao:
                jest.fn()
                    .mockRejectedValueOnce(
                        new Error(
                            'Falha interna'
                        )
                    )
                    .mockResolvedValueOnce(
                        true
                    )
        })

        await render(
            <DeleteAccount {...props} />
        )

        await continuarComSenha()

        await waitFor(() => {
            expect(
                screen.getByRole('header', {
                    name:
                        'Algo deu errado'
                })
            ).toBeOnTheScreen()
        })

        expect(
            screen.getByText(
                'Não foi possível concluir esta solicitação. Verifique sua conexão e tente novamente.'
            )
        ).toBeOnTheScreen()

        expect(
            screen.queryByText(
                'Falha interna'
            )
        ).toBeNull()

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Tentar novamente'
            })
        )

        await waitFor(() => {
            expect(
                screen.getByRole('header', {
                    name:
                        'Excluir conta permanentemente?'
                })
            ).toBeOnTheScreen()
        })

        expect(
            props.confirmarSenhaExclusao
        ).toHaveBeenCalledTimes(2)

        expect(
            props.excluirConta
        ).not.toHaveBeenCalled()
    })

    test('cancela a confirmação final sem excluir a conta', async () => {
        const props = criarProps()

        await render(
            <DeleteAccount {...props} />
        )

        await abrirConfirmacao()

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Cancelar'
            })
        )

        expect(
            props.onFechar
        ).toHaveBeenCalledTimes(1)

        expect(
            props.excluirConta
        ).not.toHaveBeenCalled()

        expect(
            screen.getByRole('header', {
                name:
                    'Confirme sua identidade'
            })
        ).toBeOnTheScreen()
    })

    test('não exclui sem receber a função de exclusão', async () => {
        const props = criarProps({
            excluirConta: undefined
        })

        await render(
            <DeleteAccount {...props} />
        )

        await abrirConfirmacao()

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Excluir permanentemente'
            })
        )

        expect(
            screen.getByRole('header', {
                name:
                    'Excluir conta permanentemente?'
            })
        ).toBeOnTheScreen()

        expect(
            props.onFechar
        ).not.toHaveBeenCalled()

        expect(
            props.onContaExcluida
        ).not.toHaveBeenCalled()
    })

    test('exclui a conta e informa o resultado', async () => {
        const resultado = {
            mensagem:
                'Conta excluída.'
        }

        const props = criarProps({
            excluirConta:
                jest.fn().mockResolvedValue(
                    resultado
                )
        })

        await render(
            <DeleteAccount {...props} />
        )

        await abrirConfirmacao(
            'senha correta'
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Excluir permanentemente'
            })
        )

        await waitFor(() => {
            expect(
                props.excluirConta
            ).toHaveBeenCalledWith({
                senhaAtual:
                    'senha correta'
            })

            expect(
                props.onFechar
            ).toHaveBeenCalledTimes(1)

            expect(
                props.onContaExcluida
            ).toHaveBeenCalledWith(
                resultado
            )
        })
    })

    test('solicita a senha novamente quando ela muda antes da exclusão', async () => {
        const erro =
            new Error('Senha alterada')

        erro.codigo =
            'SENHA_ATUAL_INCORRETA'

        const props = criarProps({
            excluirConta:
                jest.fn().mockRejectedValue(
                    erro
                )
        })

        await render(
            <DeleteAccount {...props} />
        )

        await abrirConfirmacao(
            'senha antiga'
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Excluir permanentemente'
            })
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'A senha foi alterada. Digite sua senha atual novamente.'
                )
            ).toBeOnTheScreen()
        })

        expect(
            screen.getByRole('header', {
                name:
                    'Confirme sua identidade'
            })
        ).toBeOnTheScreen()

        expect(
            props.onFechar
        ).not.toHaveBeenCalled()

        expect(
            props.onContaExcluida
        ).not.toHaveBeenCalled()
    })

    test('permite repetir a exclusão depois de erro interno', async () => {
        const resultado = {
            mensagem:
                'Conta excluída.'
        }

        const props = criarProps({
            excluirConta:
                jest.fn()
                    .mockRejectedValueOnce(
                        new Error(
                            'Erro interno'
                        )
                    )
                    .mockResolvedValueOnce(
                        resultado
                    )
        })

        await render(
            <DeleteAccount {...props} />
        )

        await abrirConfirmacao()

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Excluir permanentemente'
            })
        )

        await waitFor(() => {
            expect(
                screen.getByRole('header', {
                    name:
                        'Algo deu errado'
                })
            ).toBeOnTheScreen()
        })

        expect(
            screen.getByText(
                'Ocorreu um erro ao apagar sua conta.'
            )
        ).toBeOnTheScreen()

        expect(
            screen.queryByText(
                'Erro interno'
            )
        ).toBeNull()

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Tentar novamente'
            })
        )

        await waitFor(() => {
            expect(
                props.excluirConta
            ).toHaveBeenCalledTimes(2)

            expect(
                props.onFechar
            ).toHaveBeenCalledTimes(1)

            expect(
                props.onContaExcluida
            ).toHaveBeenCalledWith(
                resultado
            )
        })
    })

    test('fecha o aviso de erro pelo botão Voltar', async () => {
        const props = criarProps({
            confirmarSenhaExclusao:
                jest.fn().mockRejectedValue(
                    new Error(
                        'Falha interna'
                    )
                )
        })

        await render(
            <DeleteAccount {...props} />
        )

        await continuarComSenha()

        await waitFor(() => {
            expect(
                screen.getByRole('header', {
                    name:
                        'Algo deu errado'
                })
            ).toBeOnTheScreen()
        })

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar'
            })
        )

        expect(
            props.onFechar
        ).toHaveBeenCalledTimes(1)

        expect(
            screen.getByRole('header', {
                name:
                    'Confirme sua identidade'
            })
        ).toBeOnTheScreen()
    })

    test('permite concluir a exclusão sem callbacks opcionais', async () => {
        const excluirConta =
            jest.fn().mockResolvedValue({
                mensagem:
                    'Conta excluída.'
            })

        await render(
            <DeleteAccount
                visivel
                confirmarSenhaExclusao={
                    jest.fn()
                        .mockResolvedValue(
                            true
                        )
                }
                excluirConta={
                    excluirConta
                }
            />
        )

        await abrirConfirmacao()

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Excluir permanentemente'
            })
        )

        await waitFor(() => {
            expect(
                excluirConta
            ).toHaveBeenCalledTimes(1)
        })
    })
})