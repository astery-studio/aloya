import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react-native'
import {Linking} from 'react-native'

jest.mock('expo-font', () => ({useFonts: () => [true, null]}))
jest.mock('expo-status-bar', () => ({StatusBar: () => null}))
jest.mock('@expo-google-fonts/dm-sans/400Regular', () => ({DMSans_400Regular: 'regular'}))
jest.mock('@expo-google-fonts/dm-sans/500Medium', () => ({DMSans_500Medium: 'medium'}))
jest.mock('@expo-google-fonts/dm-sans/600SemiBold', () => ({DMSans_600SemiBold: 'semibold'}))
jest.mock('@expo-google-fonts/dm-sans/700Bold', () => ({DMSans_700Bold: 'bold'}))
jest.mock('../../src/app/createAppServices', () => ({
    criarServicosApp: jest.fn()
}))
jest.mock('../../src/shared/storage/tokenStorage', () => ({
    obterToken: jest.fn()
}))

jest.mock('../../src/features/auth/screens/ForgotPasswordScreen', () => jest.fn(() => null))
jest.mock('../../src/features/auth/screens/LoginScreen', () => jest.fn(() => null))
jest.mock('../../src/features/auth/screens/ResetPasswordScreen', () => jest.fn(() => null))
jest.mock('../../src/features/auth/screens/WelcomeScreen', () => jest.fn(() => null))
jest.mock('../../src/features/onboarding/screens/OnboardingScreen', () => jest.fn(() => null))
jest.mock('../../src/features/settings/screens/ChangePasswordScreen', () => ({
    ChangePasswordScreen: jest.fn(() => null)
}))
jest.mock('../../src/features/settings/screens/ProfileSettingsScreen', () => ({
    ProfileSettingsScreen: jest.fn(() => null)
}))
jest.mock('../../src/features/contraceptives/testing/ContraceptiveHuTestAccess', () => ({
    ContraceptiveHuTestAccess: jest.fn(() => null)
}))
jest.mock('../../src/features/support-network/screens/MembersScreen', () => ({
    MembersScreen: jest.fn(() => null)
}))
jest.mock('../../src/features/support-network/screens/NewSupportCategoryScreen', () => ({
    NewSupportCategoryScreen: jest.fn(() => null)
}))

jest.mock('../../src/features/settings/screens/SettingsScreen', () => {
    const ReactInterno = require('react')
    const {Pressable, Text, View} = require('react-native')

    return {
        SettingsScreen: ({onSelecionarAba}) => ReactInterno.createElement(
            View,
            null,
            ReactInterno.createElement(Text, null, 'Configurações'),
            ReactInterno.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Abrir calendário pelo menu',
                    onPress: () => onSelecionarAba('diario')
                },
                ReactInterno.createElement(Text, null, 'Diário')
            )
        )
    }
})

jest.mock('../../src/features/calendar/screens/CalendarScreenContainer', () => {
    const ReactInterno = require('react')
    const {Text, View} = require('react-native')

    return {
        CalendarScreenContainer: ({service}) => ReactInterno.createElement(
            View,
            {testID: 'calendar-container'},
            ReactInterno.createElement(
                Text,
                null,
                typeof service?.buscarMes === 'function'
                    ? 'Calendário conectado à API'
                    : 'Serviço do calendário ausente'
            )
        )
    }
})

import App from '../../src/App'
import {criarServicosApp} from '../../src/app/createAppServices'
import {obterToken} from '../../src/shared/storage/tokenStorage'

describe('App — calendário', () => {
    let servicos

    beforeEach(() => {
        jest.clearAllMocks()

        servicos = {
            authService: {},
            accountService: {
                buscarPerfil: jest.fn().mockResolvedValue({nome: 'Kayla'})
            },
            calendarService: {
                buscarMes: jest.fn()
            }
        }

        criarServicosApp.mockReturnValue(servicos)
        obterToken.mockResolvedValue({token: 'sessao-valida'})

        jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null)
        jest.spyOn(Linking, 'addEventListener').mockReturnValue({
            remove: jest.fn()
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('abre o calendário pelo menu e fornece o serviço real configurado', async () => {
        await render(<App />)

        expect(await screen.findByText('Configurações')).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('button', {name: 'Abrir calendário pelo menu'})
        )

        expect(await screen.findByText('Calendário conectado à API')).toBeOnTheScreen()
    })
})