//Testa a integração dos estados principais da tela de configurações de perfil.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'

jest.mock('../components/icons/AppIcons', () => ({
    LockKeyIcon: jest.fn(() => null),
    WarningCircleIcon: jest.fn(() => null)
}))

import { ProfileSettingsScreen } from '../screens/settings/ProfileSettingsScreen'

jest.mock(
    '../layouts/SettingsLayout/SettingsLayout',
    () => {
        const React = require('react')
        const { View } = require('react-native')

        return {
            SettingsLayout: ({
                children,
                rodape
            }) => React.createElement(
                View,
                null,
                children,
                rodape
            )
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
            onEditarCampo,
            onSalvar,
            podeSalvar
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
                            'Alterar gênero no teste',
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
                            'Salvar perfil no teste',
                        disabled: !podeSalvar,
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
            Text
        } = require('react-native')

        function GenderSelector({
            visivel,
            onSelecionar
        }) {
            if (!visivel) {
                return null
            }

            return React.createElement(
                Pressable,
                {
                    accessibilityRole:
                        'button',
                    accessibilityLabel:
                        'Escolher outro gênero',
                    onPress: () =>
                        onSelecionar('Outro')
                },
                React.createElement(
                    Text,
                    null,
                    'Outro'
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
        EditFieldSheet: () => null
    })
)

jest.mock(
    '../features/settings/account/DeleteAccount',
    () => ({
        DeleteAccount: () => null
    })
)

jest.mock(
    '../features/settings/account/LogoutConfirmation',
    () => ({
        LogoutConfirmation: () => null
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

        function SimpleModal({
            visivel,
            titulo,
            mensagem,
            acaoPrincipal
        }) {
            if (!visivel) {
                return null
            }

            const conteudo = [
                React.createElement(
                    Text,
                    {
                        key: 'titulo'
                    },
                    titulo
                )
            ]

            if (mensagem) {
                conteudo.push(
                    React.createElement(
                        Text,
                        {
                            key: 'mensagem'
                        },
                        mensagem
                    )
                )
            }

            if (acaoPrincipal) {
                conteudo.push(
                    React.createElement(
                        Pressable,
                        {
                            key: 'acao',
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                acaoPrincipal.texto,
                            onPress:
                                acaoPrincipal.aoPressionar
                        },
                        React.createElement(
                            Text,
                            null,
                            acaoPrincipal.texto
                        )
                    )
                )
            }

            return React.createElement(
                View,
                null,
                conteudo
            )
        }

        return {
            __esModule: true,
            default: SimpleModal
        }
    }
)

const perfil = {
    id: 15,
    nome: 'Julia',
    email: 'julia@email.com',
    dataNascimento: '1999-04-08',
    identidadeGenero: 'Mulher Cisgênero',
    atualizadoEm:
        '2026-09-23T10:00:00.000Z',
    consentimentoParentalNecessario: false
}

async function alterarGeneroESalvar() {
    fireEvent.press(
        screen.getByRole(
            'button',
            {
                name:
                    'Alterar gênero no teste'
            }
        )
    )

    await waitFor(() => {
        expect(
            screen.getByRole(
                'button',
                {
                    name:
                        'Escolher outro gênero'
                }
            )
        ).toBeTruthy()
    })

    fireEvent.press(
        screen.getByRole(
            'button',
            {
                name:
                    'Escolher outro gênero'
            }
        )
    )

    await waitFor(() => {
        const botaoSalvar =
            screen.getByRole(
                'button',
                {
                    name:
                        'Salvar perfil no teste'
                }
            )

        expect(
            botaoSalvar.props
                .accessibilityState
                ?.disabled
        ).not.toBe(true)
    })

    fireEvent.press(
        screen.getByRole(
            'button',
            {
                name:
                    'Salvar perfil no teste'
            }
        )
    )
}

describe('ProfileSettingsScreen', () => {
    test('informa quando o consentimento parental passa a ser necessário', async () => {
        const onSalvar =
            jest.fn().mockResolvedValue({
                ...perfil,
                identidadeGenero: 'Outro',
                consentimentoParentalNecessario:
                    true
            })

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={onSalvar}
            />
        )

        await alterarGeneroESalvar()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Dados atualizados com sucesso'
                )
            ).toBeTruthy()
        })

        expect(
            screen.getByText(
                'Para usar a Rede de Apoio, solicite a autorização do seu responsável legal.'
            )
        ).toBeTruthy()

        expect(
            onSalvar
        ).toHaveBeenCalledWith({
            identidadeGenero: 'Outro'
        })
    })

    test('mantém o modal simples quando o consentimento não é necessário', async () => {
        const onSalvar =
            jest.fn().mockResolvedValue({
                ...perfil,
                identidadeGenero: 'Outro',
                consentimentoParentalNecessario:
                    false
            })

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={onSalvar}
            />
        )

        await alterarGeneroESalvar()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Dados atualizados com sucesso'
                )
            ).toBeTruthy()
        })

        expect(
            screen.queryByText(
                'Para usar a Rede de Apoio, solicite a autorização do seu responsável legal.'
            )
        ).toBeNull()
    })

    test('fecha o aviso de sucesso pela ação principal', async () => {
        const onSalvar =
            jest.fn().mockResolvedValue({
                ...perfil,
                identidadeGenero: 'Outro',
                consentimentoParentalNecessario:
                    true
            })

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={onSalvar}
            />
        )

        await alterarGeneroESalvar()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Dados atualizados com sucesso'
                )
            ).toBeTruthy()
        })

        fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name: 'OK'
                }
            )
        )

        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Dados atualizados com sucesso'
                )
            ).toBeNull()
        })
    })
})