import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react-native'
import {CalendarScreenContainer} from '../../../../src/features/calendar/screens/CalendarScreenContainer'

const mockUseCalendar = jest.fn()

jest.mock('../../../../src/features/calendar/hooks/useCalendar', () => ({
    obterChaveMes: () => '2026-10',
    useCalendar: opcoes => mockUseCalendar(opcoes)
}))

jest.mock('../../../../src/features/calendar/screens/CalendarScreen', () => {
    const ReactInterno = require('react')
    const {Pressable, Text, View} = require('react-native')

    return {
        CalendarScreen: props => ReactInterno.createElement(
            View,
            {testID: 'calendar-screen'},
            ReactInterno.createElement(Text, null, `Confiança: ${props.confianca || 'indisponível'}`),
            ReactInterno.createElement(Text, null, `Meses: ${props.meses.length}`),
            ReactInterno.createElement(Text, null, `Carregando: ${props.carregando}`),
            ReactInterno.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Carregar anteriores',
                    onPress: props.aoCarregarAnteriores
                },
                ReactInterno.createElement(Text, null, 'Anteriores')
            ),
            ReactInterno.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Carregar posteriores',
                    onPress: props.aoCarregarPosteriores
                },
                ReactInterno.createElement(Text, null, 'Posteriores')
            ),
            ReactInterno.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Tentar novamente',
                    onPress: props.aoTentarNovamente
                },
                ReactInterno.createElement(Text, null, 'Tentar novamente')
            )
        )
    }
})

describe('CalendarScreenContainer', () => {
    beforeEach(() => {
        mockUseCalendar.mockReset()
    })

    test('conecta o serviço e encaminha o estado do mês atual', async () => {
        const service = {buscarMes: jest.fn()}
        const onSessaoExpirada = jest.fn()

        mockUseCalendar.mockReturnValue({
            meses: [{
                mes: '2026-10',
                possuiCiclos: true,
                previsao: {nivelConfianca: 'media'}
            }],
            carregando: true,
            carregandoAnteriores: false,
            carregandoPosteriores: false,
            erro: null,
            carregarAnteriores: jest.fn(),
            carregarPosteriores: jest.fn(),
            tentarNovamente: jest.fn()
        })

        await render(
            <CalendarScreenContainer
                service={service}
                onSessaoExpirada={onSessaoExpirada}
            />
        )

        expect(mockUseCalendar).toHaveBeenCalledWith({
            service,
            onSessaoExpirada
        })
        expect(screen.getByText('Confiança: media')).toBeOnTheScreen()
        expect(screen.getByText('Meses: 1')).toBeOnTheScreen()
        expect(screen.getByText('Carregando: true')).toBeOnTheScreen()
    })

    test('encaminha as ações de paginação e nova tentativa', async () => {
        const carregarAnteriores = jest.fn()
        const carregarPosteriores = jest.fn()
        const tentarNovamente = jest.fn()

        mockUseCalendar.mockReturnValue({
            meses: [],
            carregando: false,
            carregandoAnteriores: false,
            carregandoPosteriores: false,
            erro: null,
            carregarAnteriores,
            carregarPosteriores,
            tentarNovamente
        })

        await render(
            <CalendarScreenContainer
                service={{buscarMes: jest.fn()}}
                onSessaoExpirada={jest.fn()}
            />
        )

        await fireEvent.press(screen.getByRole('button', {name: 'Carregar anteriores'}))
        await fireEvent.press(screen.getByRole('button', {name: 'Carregar posteriores'}))
        await fireEvent.press(screen.getByRole('button', {name: 'Tentar novamente'}))

        expect(carregarAnteriores).toHaveBeenCalledTimes(1)
        expect(carregarPosteriores).toHaveBeenCalledTimes(1)
        expect(tentarNovamente).toHaveBeenCalledTimes(1)
    })

    test('não usa a confiança de um mês que não seja o atual', async () => {
        mockUseCalendar.mockReturnValue({
            meses: [{
                mes: '2026-09',
                possuiCiclos: true,
                previsao: {nivelConfianca: 'alta'}
            }],
            carregando: false,
            carregandoAnteriores: false,
            carregandoPosteriores: false,
            erro: null,
            carregarAnteriores: jest.fn(),
            carregarPosteriores: jest.fn(),
            tentarNovamente: jest.fn()
        })

        await render(
            <CalendarScreenContainer
                service={{buscarMes: jest.fn()}}
                onSessaoExpirada={jest.fn()}
            />
        )

        expect(screen.getByText('Confiança: indisponível')).toBeOnTheScreen()
    })
})