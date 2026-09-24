//Testa salvamento, saída, exclusão e logout na tela de perfil.
import {
    fireEvent,
    render,
    screen,
    waitFor
} from '@testing-library/react-native'

jest.mock('../components/icons/AppIcons', () => ({
    LockKeyIcon: jest.fn(() => null),
    WarningCircleIcon: jest.fn(() => null)
}))

jest.mock(
    '../layouts/SettingsLayout/SettingsLayout',
    () => {
        const React = require('react')

        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function SettingsLayout({
            children,
            rodape,
            onVoltar
        }) {
            return React.createElement(
                View,
                null,
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Voltar da tela',
                        onPress: onVoltar
                    },
                    React.createElement(
                        Text,
                        null,
                        'Voltar da tela'
                    )
                ),
                children,
                rodape
            )
        }

        return {
            SettingsLayout
        }
    }
)

jest.mock(
    '../features/settings/profile/ProfileSettings',
    () => {
        const React = require('react')

        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function ProfileSettings({
            dados,
            onEditarCampo,
            onSalvar,
            podeSalvar
        }) {
            return React.createElement(
                View,
                null,
                React.createElement(
                    Text,
                    null,
                    `Gênero atual: ${dados.identidadeGenero}`
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Alterar gênero nas ações',
                        onPress: () =>
                            onEditarCampo(
                                'identidadeGenero'
                            )
                    },
                    React.createElement(
                        Text,
                        null,
                        'Alterar gênero'
                    )
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Salvar perfil nas ações',
                        disabled:
                            !podeSalvar,
                        onPress: onSalvar
                    },
                    React.createElement(
                        Text,
                        null,
                        'Salvar perfil'
                    )
                )
            )
        }

        return {
            ProfileSettings
        }
    }
)

jest.mock(
    '../features/settings/profile/GenderSelector',
    () => {
        const React = require('react')

        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function GenderSelector({
            visivel,
            onSelecionar,
            onFechar
        }) {
            if (!visivel) {
                return null
            }

            return React.createElement(
                View,
                null,
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Selecionar Outro nas ações',
                        onPress: () =>
                            onSelecionar(
                                'Outro'
                            )
                    },
                    React.createElement(
                        Text,
                        null,
                        'Selecionar Outro'
                    )
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Fechar gênero nas ações',
                        onPress: onFechar
                    },
                    React.createElement(
                        Text,
                        null,
                        'Fechar gênero'
                    )
                )
            )
        }

        return {
            GenderSelector
        }
    }
)

jest.mock(
    '../components/feedback/EditFieldSheet/EditFieldSheet',
    () => ({
        EditFieldSheet:
            jest.fn(() => null)
    })
)

jest.mock(
    '../components/feedback/Modal/SimpleModal',
    () => {
        const React = require('react')

        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function criarAcao(
            acao,
            chave
        ) {
            if (!acao) {
                return null
            }

            return React.createElement(
                Pressable,
                {
                    key: chave,
                    accessibilityRole:
                        'button',
                    accessibilityLabel:
                        acao.texto,
                    disabled:
                        acao.desativado
                        || acao.carregando,
                    onPress:
                        acao.aoPressionar
                },
                React.createElement(
                    Text,
                    null,
                    acao.texto
                )
            )
        }

        function SimpleModal({
            visivel,
            titulo,
            mensagem,
            acaoPrincipal,
            acaoSecundaria
        }) {
            if (!visivel) {
                return null
            }

            return React.createElement(
                View,
                null,
                React.createElement(
                    Text,
                    {
                        accessibilityRole:
                            'header'
                    },
                    titulo
                ),
                mensagem
                    ? React.createElement(
                        Text,
                        null,
                        mensagem
                    )
                    : null,
                criarAcao(
                    acaoPrincipal,
                    'principal'
                ),
                criarAcao(
                    acaoSecundaria,
                    'secundaria'
                )
            )
        }

        return {
            __esModule: true,
            default: SimpleModal
        }
    }
)

jest.mock(
    '../features/settings/account/DeleteAccount',
    () => {
        const React = require('react')

        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function DeleteAccount({
            visivel,
            onFechar,
            onContaExcluida
        }) {
            if (!visivel) {
                return null
            }

            return React.createElement(
                View,
                null,
                React.createElement(
                    Text,
                    null,
                    'Exclusão visível'
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Concluir exclusão no teste',
                        onPress: () =>
                            onContaExcluida?.({
                                excluida: true
                            })
                    },
                    React.createElement(
                        Text,
                        null,
                        'Concluir exclusão'
                    )
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Fechar exclusão no teste',
                        onPress: onFechar
                    },
                    React.createElement(
                        Text,
                        null,
                        'Fechar exclusão'
                    )
                )
            )
        }

        return {
            DeleteAccount
        }
    }
)

jest.mock(
    '../features/settings/account/LogoutConfirmation',
    () => {
        const React = require('react')

        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function LogoutConfirmation({
            visivel,
            onFechar,
            onSessaoEncerrada
        }) {
            if (!visivel) {
                return null
            }

            return React.createElement(
                View,
                null,
                React.createElement(
                    Text,
                    null,
                    'Logout visível'
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Concluir logout no teste',
                        onPress: () =>
                            onSessaoEncerrada?.({
                                encerrada: true
                            })
                    },
                    React.createElement(
                        Text,
                        null,
                        'Concluir logout'
                    )
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Fechar logout no teste',
                        onPress: onFechar
                    },
                    React.createElement(
                        Text,
                        null,
                        'Fechar logout'
                    )
                )
            )
        }

        return {
            LogoutConfirmation
        }
    }
)

import { ProfileSettingsScreen } from '../screens/settings/ProfileSettingsScreen'

const perfil = {
    id: 15,
    nome: 'Julia',
    email: 'julia@email.com',
    dataNascimento: '1999-04-08',
    identidadeGenero:
        'Mulher Cisgênero',
    atualizadoEm:
        '2026-09-23T10:00:00.000Z',
    consentimentoParentalNecessario:
        false
}

async function alterarGenero() {
    await fireEvent.press(
        screen.getByRole('button', {
            name:
                'Alterar gênero nas ações'
        })
    )

    await fireEvent.press(
        screen.getByRole('button', {
            name:
                'Selecionar Outro nas ações'
        })
    )

    await waitFor(() => {
        expect(
            screen.getByText(
                'Gênero atual: Outro'
            )
        ).toBeOnTheScreen()
    })
}

async function salvarPerfil() {
    await fireEvent.press(
        screen.getByRole('button', {
            name:
                'Salvar perfil nas ações'
        })
    )
}

describe('ProfileSettingsScreen - ações', () => {
    test('volta imediatamente quando não existem alterações', async () => {
        const onVoltar = jest.fn()

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onVoltar={onVoltar}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar da tela'
            })
        )

        expect(
            onVoltar
        ).toHaveBeenCalledTimes(1)

        expect(
            screen.queryByText(
                'Dados não salvos'
            )
        ).toBeNull()
    })

    test('permite continuar editando ou sair sem salvar', async () => {
        const onVoltar = jest.fn()

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onVoltar={onVoltar}
                onSalvar={jest.fn()}
            />
        )

        await alterarGenero()

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar da tela'
            })
        )

        expect(
            screen.getByRole('header', {
                name:
                    'Dados não salvos'
            })
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Você tem atualizações não salvas. Deseja mesmo sair?'
            )
        ).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Continuar a editar'
            })
        )

        expect(
            screen.queryByText(
                'Dados não salvos'
            )
        ).toBeNull()

        expect(
            onVoltar
        ).not.toHaveBeenCalled()

        expect(
            screen.getByText(
                'Gênero atual: Outro'
            )
        ).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar da tela'
            })
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Sair sem salvar'
            })
        )

        expect(
            onVoltar
        ).toHaveBeenCalledTimes(1)

        expect(
            screen.getByText(
                'Gênero atual: Mulher Cisgênero'
            )
        ).toBeOnTheScreen()
    })

    test('tenta salvar novamente depois de erro de conexão', async () => {
        const onSalvar = jest.fn()
            .mockRejectedValueOnce(
                new Error(
                    'Falha interna'
                )
            )
            .mockResolvedValueOnce({
                ...perfil,
                identidadeGenero:
                    'Outro'
            })

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={onSalvar}
            />
        )

        await alterarGenero()
        await salvarPerfil()

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
                'Ocorreu um erro ao salvar sua conta. Verifique sua conexão e tente novamente.'
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
                onSalvar
            ).toHaveBeenCalledTimes(2)

            expect(
                screen.getByRole('header', {
                    name:
                        'Dados atualizados com sucesso'
                })
            ).toBeOnTheScreen()
        })
    })

    test('mostra mensagem específica para e-mail já cadastrado', async () => {
        const erro =
            new Error('E-mail duplicado')

        erro.codigo =
            'EMAIL_JA_CADASTRADO'

        const onSalvar =
            jest.fn().mockRejectedValue(
                erro
            )

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={onSalvar}
            />
        )

        await alterarGenero()
        await salvarPerfil()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Este e-mail já está sendo utilizado.'
                )
            ).toBeOnTheScreen()
        })

        expect(
            screen.queryByText(
                'E-mail duplicado'
            )
        ).toBeNull()
    })

    test('fecha o erro e mantém as alterações para nova tentativa', async () => {
        const onSalvar =
            jest.fn().mockRejectedValue(
                new Error(
                    'Falha interna'
                )
            )

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={onSalvar}
            />
        )

        await alterarGenero()
        await salvarPerfil()

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
            screen.queryByText(
                'Algo deu errado'
            )
        ).toBeNull()

        expect(
            screen.getByText(
                'Gênero atual: Outro'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByRole('button', {
                name:
                    'Salvar perfil nas ações'
            })
        ).toBeEnabled()
    })

    test('desativa exclusão e logout sem os serviços necessários', async () => {
        await render(
            <ProfileSettingsScreen
                perfil={perfil}
            />
        )

        expect(
            screen.getByRole('button', {
                name: 'Apagar conta'
            })
        ).toBeDisabled()

        expect(
            screen.getByRole('button', {
                name: 'Sair'
            })
        ).toBeDisabled()
    })

    test('abre, conclui e fecha o fluxo de exclusão', async () => {
        const onContaExcluida =
            jest.fn()

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                confirmarSenhaExclusao={
                    jest.fn()
                }
                excluirConta={jest.fn()}
                onContaExcluida={
                    onContaExcluida
                }
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Apagar conta'
            })
        )

        expect(
            screen.getByText(
                'Exclusão visível'
            )
        ).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Concluir exclusão no teste'
            })
        )

        expect(
            onContaExcluida
        ).toHaveBeenCalledWith({
            excluida: true
        })

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Fechar exclusão no teste'
            })
        )

        expect(
            screen.queryByText(
                'Exclusão visível'
            )
        ).toBeNull()
    })

    test('abre, conclui e fecha o fluxo de logout', async () => {
        const onSessaoEncerrada =
            jest.fn()

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                encerrarSessao={jest.fn()}
                onSessaoEncerrada={
                    onSessaoEncerrada
                }
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Sair'
            })
        )

        expect(
            screen.getByText(
                'Logout visível'
            )
        ).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Concluir logout no teste'
            })
        )

        expect(
            onSessaoEncerrada
        ).toHaveBeenCalledWith({
            encerrada: true
        })

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Fechar logout no teste'
            })
        )

        expect(
            screen.queryByText(
                'Logout visível'
            )
        ).toBeNull()
    })
})