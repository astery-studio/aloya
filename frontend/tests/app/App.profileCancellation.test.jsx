//Testa se o App cancela buscas antigas do perfil e evita respostas fora de ordem.
import {
    fireEvent,
    render,
    screen,
    waitFor
} from '@testing-library/react-native'
import {Linking} from 'react-native'

jest.mock('expo-font', () => ({
    useFonts: jest.fn(() => [true, null])
}))

jest.mock('expo-status-bar', () => ({
    StatusBar: jest.fn(() => null)
}))

jest.mock(
    '@expo-google-fonts/dm-sans/400Regular',
    () => ({
        DMSans_400Regular: 'DMSans_400Regular'
    })
)

jest.mock(
    '@expo-google-fonts/dm-sans/500Medium',
    () => ({
        DMSans_500Medium: 'DMSans_500Medium'
    })
)

jest.mock(
    '@expo-google-fonts/dm-sans/600SemiBold',
    () => ({
        DMSans_600SemiBold: 'DMSans_600SemiBold'
    })
)

jest.mock(
    '@expo-google-fonts/dm-sans/700Bold',
    () => ({
        DMSans_700Bold: 'DMSans_700Bold'
    })
)

jest.mock('../../src/app/createAppServices', () => ({
    criarServicosApp: jest.fn()
}))

jest.mock('../../src/shared/storage/tokenStorage', () => ({
    obterToken: jest.fn()
}))

jest.mock('../../src/features/auth/screens/LoginScreen', () => ({
    __esModule: true,
    default: jest.fn(() => null)
}))

jest.mock('../../src/features/settings/screens/SettingsScreen', () => {
    const React = require('react')
    const {
        Pressable,
        Text,
        View
    } = require('react-native')

    function SettingsScreen({onAbrirPerfil}) {
        return React.createElement(
            View,
            null,
            React.createElement(
                Text,
                null,
                'Tela de configurações'
            ),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Abrir perfil',
                    onPress: onAbrirPerfil
                },
                React.createElement(
                    Text,
                    null,
                    'Abrir perfil'
                )
            )
        )
    }

    return {
        SettingsScreen: jest.fn(SettingsScreen)
    }
})

jest.mock(
    '../../src/features/settings/screens/ProfileSettingsScreen',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function ProfileSettingsScreen({
            perfil,
            onRecarregar
        }) {
            return React.createElement(
                View,
                null,
                React.createElement(
                    Text,
                    null,
                    `Perfil: ${perfil?.nome ?? 'nenhum'}`
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel:
                            'Recarregar perfil',
                        onPress: onRecarregar
                    },
                    React.createElement(
                        Text,
                        null,
                        'Recarregar'
                    )
                )
            )
        }

        return {
            ProfileSettingsScreen:
                jest.fn(ProfileSettingsScreen)
        }
    }
)

jest.mock(
    '../../src/features/settings/screens/ChangePasswordScreen',
    () => ({
        ChangePasswordScreen:
            jest.fn(() => null)
    })
)

jest.mock(
    '../../src/features/contraceptives/ContraceptiveFlow',
    () => ({
        ContraceptiveFlow:
            jest.fn(() => null)
    })
)

jest.mock(
    '../../src/features/support-network/screens/MembersScreen',
    () => ({
        MembersScreen:
            jest.fn(() => null)
    })
)

jest.mock(
    '../../src/features/support-network/screens/NewSupportCategoryScreen',
    () => ({
        NewSupportCategoryScreen:
            jest.fn(() => null)
    })
)

import App from '../../src/App'
import {
    criarServicosApp
} from '../../src/app/createAppServices'
import {
    obterToken
} from '../../src/shared/storage/tokenStorage'

const perfil = {
    id: 1,
    nome: 'Julia',
    email: 'julia@email.com',
    dataNascimento: '1999-04-08',
    identidadeGenero: 'Mulher Cisgênero',
    atualizadoEm: '2026-09-23T10:00:00.000Z',
    consentimentoParentalNecessario: false
}

//Cria um erro igual ao produzido quando uma requisição é cancelada.
function criarErroAbortado() {
    const erro =
        new Error('Requisição cancelada.')

    erro.name = 'AbortError'

    return erro
}

//Cria os serviços necessários para renderizar o App durante os testes.
function criarServicos(buscarPerfil) {
    return {
        authService: {
            realizarLogin: jest.fn(),
            encerrarSessao: jest.fn()
        },

        accountService: {
            buscarPerfil,
            atualizarPerfil: jest.fn(),
            alterarSenha: jest.fn(),
            excluirConta: jest.fn(),
            confirmarSenhaExclusao: jest.fn()
        },

        contraceptiveService: {},

        supportCategoryService: {
            criarCategoria: jest.fn()
        }
    }
}

describe(
    'App - cancelamento da busca do perfil',
    () => {
        beforeEach(() => {
            jest.clearAllMocks()

            obterToken.mockResolvedValue({
                token: 'token-valido'
            })

            jest.spyOn(
                Linking,
                'getInitialURL'
            ).mockResolvedValue(null)

            jest.spyOn(
                Linking,
                'addEventListener'
            ).mockReturnValue({
                remove: jest.fn()
            })
        })

        afterEach(() => {
            jest.restoreAllMocks()
        })

        test(
            'cancela a busca anterior ao recarregar o perfil',
            async () => {
                let primeiroSinal

                const buscarPerfil = jest.fn()
                    .mockImplementationOnce(
                        ({signal}) => {
                            primeiroSinal = signal

                            return new Promise(
                                (_, rejeitar) => {
                                    signal.addEventListener(
                                        'abort',
                                        () => {
                                            rejeitar(
                                                criarErroAbortado()
                                            )
                                        },
                                        {
                                            once: true
                                        }
                                    )
                                }
                            )
                        }
                    )
                    .mockResolvedValueOnce(perfil)

                criarServicosApp.mockReturnValue(
                    criarServicos(buscarPerfil)
                )

                await render(<App />)

                await waitFor(() => {
                    expect(
                        buscarPerfil
                    ).toHaveBeenCalledTimes(1)

                    expect(
                        screen.getByText(
                            'Tela de configurações'
                        )
                    ).toBeOnTheScreen()
                })

                expect(
                    primeiroSinal.aborted
                ).toBe(false)

                await fireEvent.press(
                    screen.getByRole('button', {
                        name: 'Abrir perfil'
                    })
                )

                await fireEvent.press(
                    screen.getByRole('button', {
                        name: 'Recarregar perfil'
                    })
                )

                await waitFor(() => {
                    expect(
                        buscarPerfil
                    ).toHaveBeenCalledTimes(2)

                    expect(
                        screen.getByText(
                            'Perfil: Julia'
                        )
                    ).toBeOnTheScreen()
                })

                expect(
                    primeiroSinal.aborted
                ).toBe(true)

                expect(
                    buscarPerfil.mock.calls[1][0]
                        .signal
                ).not.toBe(primeiroSinal)
            }
        )

        test(
            'cancela a busca quando o aplicativo é desmontado',
            async () => {
                let sinalRecebido

                const buscarPerfil = jest.fn(
                    ({signal}) => {
                        sinalRecebido = signal

                        return new Promise(
                            (_, rejeitar) => {
                                signal.addEventListener(
                                    'abort',
                                    () => {
                                        rejeitar(
                                            criarErroAbortado()
                                        )
                                    },
                                    {
                                        once: true
                                    }
                                )
                            }
                        )
                    }
                )

                criarServicosApp.mockReturnValue(
                    criarServicos(buscarPerfil)
                )

                const resultado =
                    await render(<App />)

                await waitFor(() => {
                    expect(
                        buscarPerfil
                    ).toHaveBeenCalledTimes(1)
                })

                expect(
                    sinalRecebido.aborted
                ).toBe(false)

                await resultado.unmount()

                expect(
                    sinalRecebido.aborted
                ).toBe(true)
            }
        )
    }
)
