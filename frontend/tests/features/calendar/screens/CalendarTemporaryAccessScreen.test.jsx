import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react-native'

import {CalendarTemporaryAccessScreen} from '../../../../src/features/calendar/testing/CalendarTemporaryAccessScreen'

jest.mock('../../../../src/shared/layouts/MainLayout/MainLayout', () => {
    const ReactInterno = require('react')
    const {Pressable, Text, View} = require('react-native')

    return {
        MainLayout: ({titulo, abaAtiva, onSelecionarAba, children}) => ReactInterno.createElement(
            View,
            {testID: 'main-layout'},
            ReactInterno.createElement(Text, null, titulo),
            ReactInterno.createElement(Text, null, `Aba: ${abaAtiva}`),
            children,
            ReactInterno.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Abrir configurações',
                    onPress: () => onSelecionarAba?.('configuracoes')
                },
                ReactInterno.createElement(Text, null, 'Configurações')
            )
        )
    }
})

describe('CalendarTemporaryAccessScreen', () => {
    test('mantém o menu no Diário e abre o calendário pelo botão provisório', async () => {
        const aoAbrirCalendario = jest.fn()
        const onSelecionarAba = jest.fn()

        await render(
            <CalendarTemporaryAccessScreen
                aoAbrirCalendario={aoAbrirCalendario}
                onSelecionarAba={onSelecionarAba}
            />
        )

        expect(screen.getByText('Diário')).toBeOnTheScreen()
        expect(screen.getByText('Aba: diario')).toBeOnTheScreen()

        await fireEvent.press(screen.getByRole('button', {name: 'Abrir calendário'}))
        await fireEvent.press(screen.getByRole('button', {name: 'Abrir configurações'}))

        expect(aoAbrirCalendario).toHaveBeenCalledTimes(1)
        expect(onSelecionarAba).toHaveBeenCalledWith('configuracoes')
    })
})
