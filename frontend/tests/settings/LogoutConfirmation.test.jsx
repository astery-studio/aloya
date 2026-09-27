//Testa a confirmação, execução e recuperação de erros durante o logout.
import {
    fireEvent,
    render,
    screen,
    waitFor
} from '@testing-library/react-native'

jest.mock('../../components/icons/AppIcons', () => ({
    LockKeyIcon: jest.fn(() => null),
    WarningCircleIcon: jest.fn(() => null)
}))

import { LogoutConfirmation } from '../../features/settings/account/LogoutConfirmation'

describe('LogoutConfirmation', () => {
    test('não mostra o conteúdo quando está oculto', async () => {
        await render(
            <LogoutConfirmation
                visivel={false}
                onFechar={jest.fn()}
                encerrarSessao={jest.fn()}
                onSessaoEncerrada={jest.fn()}
            />
        )

        expect(
            screen.queryByText(
                'Sair da Conta'
            )
        ).toBeNull()
    })

    test('mostra a confirmação de saída', async () => {
        await render(
            <LogoutConfirmation
                visivel
                onFechar={jest.fn()}
                encerrarSessao={jest.fn()}
                onSessaoEncerrada={jest.fn()}
            />
        )

        expect(
            screen.getByRole('header', {
                name: 'Sair da Conta'
            })
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Você deverá realizar login novamente para acessar sua conta.'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Deseja continuar?'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByRole('button', {
                name: 'Sair da conta'
            })
        ).toBeEnabled()

        expect(
            screen.getByRole('button', {
                name: 'Voltar'
            })
        ).toBeEnabled()
    })

    test('fecha a confirmação pelo botão Voltar', async () => {
        const onFechar = jest.fn()
        const encerrarSessao = jest.fn()

        await render(
            <LogoutConfirmation
                visivel
                onFechar={onFechar}
                encerrarSessao={
                    encerrarSessao
                }
                onSessaoEncerrada={
                    jest.fn()
                }
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar'
            })
        )

        expect(
            onFechar
        ).toHaveBeenCalledTimes(1)

        expect(
            encerrarSessao
        ).not.toHaveBeenCalled()
    })

    test('fecha a confirmação pela ação de voltar do sistema', async () => {
        const onFechar = jest.fn()

        await render(
            <LogoutConfirmation
                visivel
                onFechar={onFechar}
                encerrarSessao={jest.fn()}
                onSessaoEncerrada={jest.fn()}
            />
        )

        await fireEvent(
            screen.root,
            'requestClose'
        )

        expect(
            onFechar
        ).toHaveBeenCalledTimes(1)
    })

    test('não tenta sair sem receber a função de logout', async () => {
        const onFechar = jest.fn()
        const onSessaoEncerrada = jest.fn()

        await render(
            <LogoutConfirmation
                visivel
                onFechar={onFechar}
                onSessaoEncerrada={
                    onSessaoEncerrada
                }
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Sair da conta'
            })
        )

        expect(
            onFechar
        ).not.toHaveBeenCalled()

        expect(
            onSessaoEncerrada
        ).not.toHaveBeenCalled()
    })

    test('encerra a sessão e informa o resultado', async () => {
        const resultadoLogout = {
            sessaoLocalEncerrada: true,
            sessaoRemotaEncerrada: true
        }

        const encerrarSessao =
            jest.fn().mockResolvedValue(
                resultadoLogout
            )

        const onFechar = jest.fn()
        const onSessaoEncerrada = jest.fn()

        await render(
            <LogoutConfirmation
                visivel
                onFechar={onFechar}
                encerrarSessao={
                    encerrarSessao
                }
                onSessaoEncerrada={
                    onSessaoEncerrada
                }
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Sair da conta'
            })
        )

        await waitFor(() => {
            expect(
                encerrarSessao
            ).toHaveBeenCalledTimes(1)

            expect(
                onFechar
            ).toHaveBeenCalledTimes(1)

            expect(
                onSessaoEncerrada
            ).toHaveBeenCalledWith(
                resultadoLogout
            )
        })
    })

    test('mostra uma mensagem segura quando o logout falha', async () => {
        const encerrarSessao =
            jest.fn().mockRejectedValue(
                new Error(
                    'Detalhe interno do armazenamento'
                )
            )

        const onFechar = jest.fn()
        const onSessaoEncerrada = jest.fn()

        await render(
            <LogoutConfirmation
                visivel
                onFechar={onFechar}
                encerrarSessao={
                    encerrarSessao
                }
                onSessaoEncerrada={
                    onSessaoEncerrada
                }
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Sair da conta'
            })
        )

        await waitFor(() => {
            expect(
                screen.getByRole('header', {
                    name:
                        'Não foi possível sair'
                })
            ).toBeOnTheScreen()
        })

        expect(
            screen.getByText(
                'Não foi possível limpar sua sessão deste aparelho. Tente novamente.'
            )
        ).toBeOnTheScreen()

        expect(
            screen.queryByText(
                'Detalhe interno do armazenamento'
            )
        ).toBeNull()

        expect(
            screen.queryByText(
                'Sair da Conta'
            )
        ).toBeNull()

        expect(
            onFechar
        ).not.toHaveBeenCalled()

        expect(
            onSessaoEncerrada
        ).not.toHaveBeenCalled()
    })

    test('volta para a confirmação depois de fechar o erro', async () => {
        const encerrarSessao =
            jest.fn().mockRejectedValue(
                new Error(
                    'Falha interna'
                )
            )

        const onFechar = jest.fn()

        await render(
            <LogoutConfirmation
                visivel
                onFechar={onFechar}
                encerrarSessao={
                    encerrarSessao
                }
                onSessaoEncerrada={
                    jest.fn()
                }
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Sair da conta'
            })
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: 'Voltar'
                })
            ).toBeOnTheScreen()
        })

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar'
            })
        )

        await waitFor(() => {
            expect(
                screen.getByRole('header', {
                    name: 'Sair da Conta'
                })
            ).toBeOnTheScreen()
        })

        expect(
            onFechar
        ).not.toHaveBeenCalled()
    })

    test('tenta novamente e conclui o logout depois de uma falha', async () => {
        const resultadoLogout = {
            sessaoLocalEncerrada: true,
            sessaoRemotaEncerrada: true
        }

        const encerrarSessao = jest.fn()
            .mockRejectedValueOnce(
                new Error(
                    'Falha temporária'
                )
            )
            .mockResolvedValueOnce(
                resultadoLogout
            )

        const onFechar = jest.fn()
        const onSessaoEncerrada = jest.fn()

        await render(
            <LogoutConfirmation
                visivel
                onFechar={onFechar}
                encerrarSessao={
                    encerrarSessao
                }
                onSessaoEncerrada={
                    onSessaoEncerrada
                }
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Sair da conta'
            })
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: 'Tentar novamente'
                })
            ).toBeOnTheScreen()
        })

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Tentar novamente'
            })
        )

        await waitFor(() => {
            expect(
                encerrarSessao
            ).toHaveBeenCalledTimes(2)

            expect(
                onFechar
            ).toHaveBeenCalledTimes(1)

            expect(
                onSessaoEncerrada
            ).toHaveBeenCalledWith(
                resultadoLogout
            )
        })
    })

    test('permite concluir o logout sem callbacks opcionais', async () => {
        const encerrarSessao =
            jest.fn().mockResolvedValue({
                sessaoLocalEncerrada: true
            })

        await render(
            <LogoutConfirmation
                visivel
                encerrarSessao={
                    encerrarSessao
                }
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Sair da conta'
            })
        )

        await waitFor(() => {
            expect(
                encerrarSessao
            ).toHaveBeenCalledTimes(1)
        })
    })
})