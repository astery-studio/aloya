// Testa conteúdo, variantes e fechamento do painel de legenda.
import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react-native'
import {CycleLegendSheet} from '../../../../src/features/calendar/components/CycleLegendSheet/CycleLegendSheet'

jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => {
    const ReactInterno = require('react')
    const {View} = require('react-native')

    return {
        BottomSheet: ({visivel, children}) => (
            visivel
                ? ReactInterno.createElement(
                    View,
                    {testID: 'bottom-sheet-compartilhado'},
                    children
                )
                : null
        )
    }
})

const itensLegenda = [
    {
        id: 'menstruacao-real',
        tipo: 'menstruacao',
        titulo: 'Menstruação',
        descricao: 'Dias de menstruação',
        prevista: false
    },
    {
        id: 'folicular-real',
        tipo: 'folicular',
        titulo: 'Fase Folicular',
        descricao: 'Período de fase folicular',
        prevista: false
    },
    {
        id: 'ovulacao-real',
        tipo: 'ovulacao',
        titulo: 'Ovulação',
        descricao: 'Período de ovulação',
        prevista: false
    },
    {
        id: 'lutea-real',
        tipo: 'lutea',
        titulo: 'Fase Lútea',
        descricao: 'Período de fase lútea',
        prevista: false
    },
    {
        id: 'janela-real',
        tipo: 'janelaFertil',
        titulo: 'Janela Fértil',
        descricao: 'Dias com maior probabilidade de engravidar',
        prevista: false
    },
    {
        id: 'menstruacao-prevista',
        tipo: 'menstruacao',
        titulo: 'Provável Menstruação',
        descricao: 'Previsão dos dias de menstruação',
        prevista: true
    },
    {
        id: 'folicular-prevista',
        tipo: 'folicular',
        titulo: 'Provável Fase Folicular',
        descricao: 'Previsão do período de fase folicular',
        prevista: true
    },
    {
        id: 'ovulacao-prevista',
        tipo: 'ovulacao',
        titulo: 'Provável Ovulação',
        descricao: 'Previsão do período de ovulação',
        prevista: true
    },
    {
        id: 'lutea-prevista',
        tipo: 'lutea',
        titulo: 'Provável Fase Lútea',
        descricao: 'Previsão do período de fase lútea',
        prevista: true
    },
    {
        id: 'janela-prevista',
        tipo: 'janelaFertil',
        titulo: 'Provável Janela Fértil',
        descricao: 'Previsão da janela fértil',
        prevista: true
    }
]

describe('CycleLegendSheet', () => {
    test('não renderiza o painel quando está invisível', async () => {
        await render(
            <CycleLegendSheet
                visivel={false}
                itens={itensLegenda}
                aoFechar={jest.fn()}
            />
        )

        expect(screen.queryByTestId('bottom-sheet-compartilhado')).toBeNull()
    })

    test('mostra título e os dez itens da legenda', async () => {
        await render(
            <CycleLegendSheet
                visivel
                itens={itensLegenda}
                aoFechar={jest.fn()}
            />
        )

        expect(screen.getByText('Legenda')).toBeOnTheScreen()

        for (const item of itensLegenda) {
            expect(screen.getByText(item.titulo)).toBeOnTheScreen()
            expect(screen.getByText(item.descricao)).toBeOnTheScreen()
            expect(screen.getByTestId(`item-legenda-${item.id}`)).toBeOnTheScreen()
        }
    })

    test('diferencia marcadores reais e previstos', async () => {
        await render(
            <CycleLegendSheet
                visivel
                itens={itensLegenda}
                aoFechar={jest.fn()}
            />
        )

        expect(
            screen.getByTestId('marcador-legenda-menstruacao-real')
        ).toHaveStyle({
            backgroundColor: 'rgba(200, 90, 68, 0.90)'
        })

        expect(
            screen.getByTestId('marcador-legenda-menstruacao-prevista')
        ).toHaveStyle({
            backgroundColor: 'rgba(200, 90, 68, 0.58)'
        })

        expect(
            screen.getByTestId('marcador-legenda-janelaFertil-real')
        ).toHaveStyle({
            borderStyle: 'dashed',
            borderColor: 'rgba(34, 34, 34, 0.70)'
        })

        expect(
            screen.getByTestId('marcador-legenda-janelaFertil-prevista')
        ).toHaveStyle({
            borderStyle: 'dashed',
            borderColor: 'rgba(34, 34, 34, 0.42)'
        })
    })

    test('fecha pelo botão do cabeçalho', async () => {
        const aoFechar = jest.fn()

        await render(
            <CycleLegendSheet
                visivel
                itens={itensLegenda}
                aoFechar={aoFechar}
            />
        )

        fireEvent.press(screen.getByRole('button', {name: 'Fechar painel'}))

        expect(aoFechar).toHaveBeenCalledTimes(1)
    })

    test('tolera itens inválidos sem quebrar o painel', async () => {
        await render(
            <CycleLegendSheet
                visivel
                itens={[null, {}, ...itensLegenda.slice(0, 1)]}
                aoFechar={jest.fn()}
            />
        )

        expect(screen.getByText('Menstruação')).toBeOnTheScreen()
        expect(screen.queryByText('undefined')).toBeNull()
    })
})
