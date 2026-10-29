import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'
import {
    Alert,
    Linking
} from 'react-native'

import App from '../../src/App'
import {
    criarServicosApp
} from '../../src/app/createAppServices'
import {
    obterToken
} from '../../src/shared/storage/tokenStorage'

jest.mock('expo-font', () => ({
    useFonts: () => [true, null]
}))

jest.mock(
    '../../src/app/createAppServices',
    () => ({
        criarServicosApp: jest.fn()
    })
)

jest.mock(
    '../../src/shared/storage/tokenStorage',
    () => ({
        obterToken: jest.fn()
    })
)

jest.mock(
    '../../src/features/auth/screens/ForgotPasswordScreen',
    () => jest.fn(() => null)
)

jest.mock(
    '../../src/features/auth/screens/LoginScreen',
    () => jest.fn(() => null)
)

jest.mock(
    '../../src/features/auth/screens/ResetPasswordScreen',
    () => jest.fn(() => null)
)

jest.mock(
    '../../src/features/auth/screens/WelcomeScreen',
    () => jest.fn(() => null)
)

jest.mock(
    '../../src/features/onboarding/screens/OnboardingScreen',
    () => jest.fn(() => null)
)

jest.mock(
    '../../src/features/calendar/screens/CalendarScreenContainer',
    () => ({
        CalendarScreenContainer:
            jest.fn(() => null)
    })
)

jest.mock(
    '../../src/features/cycles/CycleHistoryFlow',
    () => ({
        CycleHistoryFlow:
            jest.fn(() => null)
    })
)

jest.mock(
    '../../src/features/cycles/screens/CycleTodayContainer',
    () => ({
        CycleTodayContainer:
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
    '../../src/features/settings/screens/ChangePasswordScreen',
    () => ({
        ChangePasswordScreen:
            jest.fn(() => null)
    })
)

jest.mock(
    '../../src/features/settings/screens/ProfileSettingsScreen',
    () => ({
        ProfileSettingsScreen:
            jest.fn(() => null)
    })
)

jest.mock(
    '../../src/features/settings/screens/SettingsScreen',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        return {
            SettingsScreen: ({
                onSelecionarAba
            }) => React.createElement(
                View,
                null,
                React.createElement(
                    Text,
                    null,
                    'Configurações'
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Abrir membros',
                        onPress: () =>
                            onSelecionarAba(
                                'membros'
                            )
                    },
                    React.createElement(
                        Text,
                        null,
                        'Membros'
                    )
                )
            )
        }
    }
)

jest.mock(
    '../../src/features/support-network/screens/MembersScreen',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        return {
            MembersScreen: ({
                onAbrirCategorias
            }) => React.createElement(
                View,
                null,
                React.createElement(
                    Text,
                    null,
                    'Tela de Membros'
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Abrir categorias',
                        onPress:
                            onAbrirCategorias
                    },
                    React.createElement(
                        Text,
                        null,
                        'Categorias'
                    )
                )
            )
        }
    }
)

jest.mock(
    '../../src/features/support-network/screens/SupportCategoriesScreen',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        return {
            SupportCategoriesScreen:
                jest.fn(({
                    service,
                    onVoltar,
                    onCriar,
                    onEditar,
                    onExcluir
                }) => React.createElement(
                    View,
                    {
                        testID:
                            'categorias-permissao'
                    },
                    React.createElement(
                        Text,
                        null,
                        service
                            ?.listarCategorias
                            ? 'Serviço conectado'
                            : 'Serviço ausente'
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                'Voltar para membros',
                            onPress: onVoltar
                        },
                        React.createElement(
                            Text,
                            null,
                            'Voltar'
                        )
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                'Criar categoria',
                            onPress: onCriar
                        },
                        React.createElement(
                            Text,
                            null,
                            'Criar'
                        )
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                'Editar categoria',
                            onPress: () =>
                                onEditar({
                                    id: 1,
                                    nome:
                                        'Família'
                                })
                        },
                        React.createElement(
                            Text,
                            null,
                            'Editar'
                        )
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                'Excluir categoria',
                            onPress: () =>
                                onExcluir({
                                    id: 1,
                                    nome:
                                        'Família'
                                })
                        },
                        React.createElement(
                            Text,
                            null,
                            'Excluir'
                        )
                    )
                ))
        }
    }
)

jest.mock(
    '../../src/features/support-network/screens/NewSupportCategoryScreen',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        return {
            NewSupportCategoryScreen:
                ({onVoltar, onConcluido}) =>
                    React.createElement(
                        View,
                        null,
                        React.createElement(
                            Text,
                            null,
                            'Nova categoria'
                        ),
                        React.createElement(
                            Pressable,
                            {
                                accessibilityRole:
                                    'button',
                                accessibilityLabel:
                                    'Cancelar criação',
                                onPress:
                                    onVoltar
                            },
                            React.createElement(
                                Text,
                                null,
                                'Cancelar'
                            )
                        ),
                        React.createElement(
                            Pressable,
                            {
                                accessibilityRole:
                                    'button',
                                accessibilityLabel:
                                    'Concluir criação',
                                onPress:
                                    onConcluido
                            },
                            React.createElement(
                                Text,
                                null,
                                'Concluir'
                            )
                        )
                    )
        }
    }
)

function criarServicos() {
    return {
        authService: {},
        accountService: {
            buscarPerfil:
                jest.fn()
                    .mockResolvedValue({
                        nome: 'Usuária'
                    })
        },
        calendarService: {},
        contraceptiveService: {},
        cycleHistoryService: {},
        cyclePredictionService: {},
        supportCategoryService: {
            listarCategorias:
                jest.fn(),
            criarCategoria:
                jest.fn()
        }
    }
}

async function abrirCategorias() {
    await fireEvent.press(
        await screen.findByRole(
            'button',
            {
                name:
                    'Abrir membros'
            }
        )
    )

    await fireEvent.press(
        screen.getByRole(
            'button',
            {
                name:
                    'Abrir categorias'
            }
        )
    )
}

describe(
    'fluxo de categorias no App',
    () => {
        beforeEach(() => {
            jest.clearAllMocks()

            criarServicosApp
                .mockReturnValue(
                    criarServicos()
                )

            obterToken
                .mockResolvedValue({
                    token:
                        'token-valido'
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

            jest.spyOn(
                Alert,
                'alert'
            ).mockImplementation(
                () => {}
            )
        })

        afterEach(() => {
            jest.restoreAllMocks()
        })

        test('abre a listagem e conecta o serviço', async () => {
            await render(<App />)

            await abrirCategorias()

            expect(
                await screen.findByText(
                    'Serviço conectado'
                )
            ).toBeOnTheScreen()
        })

        test('volta da listagem para membros', async () => {
            await render(<App />)

            await abrirCategorias()

            await fireEvent.press(
                screen.getByRole(
                    'button',
                    {
                        name:
                            'Voltar para membros'
                    }
                )
            )

            expect(
                await screen.findByText(
                    'Tela de Membros'
                )
            ).toBeOnTheScreen()
        })

        test('abre a criação e retorna para a listagem ao cancelar', async () => {
            await render(<App />)

            await abrirCategorias()

            await fireEvent.press(
                screen.getByRole(
                    'button',
                    {
                        name:
                            'Criar categoria'
                    }
                )
            )

            expect(
                await screen.findByText(
                    'Nova categoria'
                )
            ).toBeOnTheScreen()

            await fireEvent.press(
                screen.getByRole(
                    'button',
                    {
                        name:
                            'Cancelar criação'
                    }
                )
            )

            expect(
                await screen.findByText(
                    'Serviço conectado'
                )
            ).toBeOnTheScreen()
        })

        test('retorna para a listagem depois de concluir a criação', async () => {
            await render(<App />)

            await abrirCategorias()

            await fireEvent.press(
                screen.getByRole(
                    'button',
                    {
                        name:
                            'Criar categoria'
                    }
                )
            )

            await fireEvent.press(
                screen.getByRole(
                    'button',
                    {
                        name:
                            'Concluir criação'
                    }
                )
            )

            expect(
                await screen.findByText(
                    'Serviço conectado'
                )
            ).toBeOnTheScreen()
        })

        test('encaminha edição e exclusão para os fluxos provisórios', async () => {
            await render(<App />)

            await abrirCategorias()

            await fireEvent.press(
                screen.getByRole(
                    'button',
                    {
                        name:
                            'Editar categoria'
                    }
                )
            )

            expect(
                Alert.alert
            ).toHaveBeenCalledWith(
                'Editar categoria',
                'Família'
            )

            await fireEvent.press(
                screen.getByRole(
                    'button',
                    {
                        name:
                            'Excluir categoria'
                    }
                )
            )

            expect(
                Alert.alert
            ).toHaveBeenCalledWith(
                'Excluir categoria',
                'Família'
            )
        })
    }
)