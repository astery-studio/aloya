//Testa o conteúdo, a navegação e o interruptor da tela principal de configurações.
import {fireEvent, render, screen} from '@testing-library/react-native'

jest.mock('../components/icons/AppIcons', () => {
    const IconeTeste = () => null

    return {
        ArrowsClockwiseIcon: IconeTeste,
        BellIcon: IconeTeste,
        HouseIcon: IconeTeste,
        InfoIcon: IconeTeste,
        MoonIcon: IconeTeste,
        ShieldCheckIcon: IconeTeste,
        UserIcon: IconeTeste
    }
})

jest.mock('../components/common/NavigationField/NavigationField', () => {
    const React = require('react')
    const {Pressable, Text} = require('react-native')

    function NavigationField({label, onPress, desabilitado = false}) {
        const estaDesabilitado = desabilitado || typeof onPress !== 'function'

        return React.createElement(
            Pressable,
            {
                onPress,
                disabled: estaDesabilitado,
                accessibilityRole: 'button',
                accessibilityLabel: label,
                accessibilityState: {disabled: estaDesabilitado}
            },
            React.createElement(Text, null, label)
        )
    }

    return {NavigationField}
})

jest.mock('../layouts/MainLayout/MainLayout', () => {
    const React = require('react')
    const {Pressable, Text, View} = require('react-native')

    function MainLayout({titulo, abaAtiva, onSelecionarAba, children}) {
        return React.createElement(
            View,
            null,
            React.createElement(Text, null, titulo),
            React.createElement(Text, null, `Aba ativa: ${abaAtiva}`),
            children,
            React.createElement(
                Pressable,
                {
                    onPress: () => onSelecionarAba?.('inicio'),
                    disabled: typeof onSelecionarAba !== 'function',
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Selecionar aba Início'
                },
                React.createElement(Text, null, 'Início')
            )
        )
    }

    return {MainLayout}
})

import {SettingsScreen} from '../screens/settings/SettingsScreen'

describe('SettingsScreen', () => {
    test('mostra todas as seções e opções do protótipo', async () => {
        await render(<SettingsScreen />)

        expect(screen.getByText('Configurações')).toBeOnTheScreen()
        expect(screen.getByText('Minha Conta')).toBeOnTheScreen()
        expect(screen.getByText('Configurações de Perfil')).toBeOnTheScreen()
        expect(screen.getByText('Meu Ciclo')).toBeOnTheScreen()
        expect(screen.getByText('Parâmetros do Ciclo')).toBeOnTheScreen()
        expect(screen.getByText('Preferências')).toBeOnTheScreen()
        expect(screen.getByText('Modo noturno')).toBeOnTheScreen()
        expect(screen.getByText('Tela inicial')).toBeOnTheScreen()
        expect(screen.getByText('Notificações')).toBeOnTheScreen()
        expect(screen.getByText('Privacidade e Sobre')).toBeOnTheScreen()
        expect(screen.getByText('Sobre a aplicação')).toBeOnTheScreen()
        expect(screen.getByText('Políticas de Privacidade')).toBeOnTheScreen()
        expect(screen.getByText('Aba ativa: configuracoes')).toBeOnTheScreen()
    })

    test('encaminha separadamente cada ação de navegação', async () => {
        const onAbrirPerfil = jest.fn()
        const onAbrirParametrosCiclo = jest.fn()
        const onAbrirTelaInicial = jest.fn()
        const onAbrirNotificacoes = jest.fn()
        const onAbrirSobre = jest.fn()
        const onAbrirPoliticasPrivacidade = jest.fn()

        await render(
            <SettingsScreen
                onAbrirPerfil={onAbrirPerfil}
                onAbrirParametrosCiclo={onAbrirParametrosCiclo}
                onAbrirTelaInicial={onAbrirTelaInicial}
                onAbrirNotificacoes={onAbrirNotificacoes}
                onAbrirSobre={onAbrirSobre}
                onAbrirPoliticasPrivacidade={onAbrirPoliticasPrivacidade}
            />
        )

        await fireEvent.press(screen.getByRole('button', {name: 'Configurações de Perfil'}))
        await fireEvent.press(screen.getByRole('button', {name: 'Parâmetros do Ciclo'}))
        await fireEvent.press(screen.getByRole('button', {name: 'Tela inicial'}))
        await fireEvent.press(screen.getByRole('button', {name: 'Notificações'}))
        await fireEvent.press(screen.getByRole('button', {name: 'Sobre a aplicação'}))
        await fireEvent.press(screen.getByRole('button', {name: 'Políticas de Privacidade'}))

        expect(onAbrirPerfil).toHaveBeenCalledTimes(1)
        expect(onAbrirParametrosCiclo).toHaveBeenCalledTimes(1)
        expect(onAbrirTelaInicial).toHaveBeenCalledTimes(1)
        expect(onAbrirNotificacoes).toHaveBeenCalledTimes(1)
        expect(onAbrirSobre).toHaveBeenCalledTimes(1)
        expect(onAbrirPoliticasPrivacidade).toHaveBeenCalledTimes(1)
    })

    test('mostra e altera o estado controlado do modo noturno', async () => {
        const onAlterarModoNoturno = jest.fn()

        await render(<SettingsScreen modoNoturnoAtivo onAlterarModoNoturno={onAlterarModoNoturno} />)

        const interruptor = screen.getByRole('switch', {name: 'Modo noturno'})

        expect(interruptor.props.accessibilityState).toEqual({checked: true, disabled: false})

        await fireEvent(interruptor, 'valueChange', false)

        expect(onAlterarModoNoturno).toHaveBeenCalledTimes(1)
        expect(onAlterarModoNoturno).toHaveBeenCalledWith(false)
    })

    test('desabilita opções que ainda não receberam uma ação', async () => {
        await render(<SettingsScreen />)

        expect(screen.getByRole('button', {name: 'Configurações de Perfil'})).toBeDisabled()
        expect(screen.getByRole('button', {name: 'Parâmetros do Ciclo'})).toBeDisabled()
        expect(screen.getByRole('button', {name: 'Tela inicial'})).toBeDisabled()
        expect(screen.getByRole('button', {name: 'Notificações'})).toBeDisabled()
        expect(screen.getByRole('button', {name: 'Sobre a aplicação'})).toBeDisabled()
        expect(screen.getByRole('button', {name: 'Políticas de Privacidade'})).toBeDisabled()
        expect(screen.getByRole('switch', {name: 'Modo noturno'})).toBeDisabled()
    })

    test('encaminha a seleção da barra inferior', async () => {
        const onSelecionarAba = jest.fn()

        await render(<SettingsScreen onSelecionarAba={onSelecionarAba} />)
        await fireEvent.press(screen.getByRole('button', {name: 'Selecionar aba Início'}))

        expect(onSelecionarAba).toHaveBeenCalledTimes(1)
        expect(onSelecionarAba).toHaveBeenCalledWith('inicio')
    })
})