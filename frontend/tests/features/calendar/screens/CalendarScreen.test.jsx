import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native'
import {CalendarScreen} from '../../../../src/features/calendar/screens/CalendarScreen'

jest.mock('../../../../src/shared/layouts/MainLayout/MainLayout', () => {
    const ReactInterno = require('react')
    const {Text, View} = require('react-native')

    return {
        MainLayout: ({titulo, children}) => ReactInterno.createElement(
            View,
            {testID: 'main-layout'},
            ReactInterno.createElement(Text, null, titulo),
            children
        )
    }
})

jest.mock('../../../../src/shared/components/common/ConfidenceBadge/ConfidenceBadge', () => {
    const ReactInterno = require('react')
    const {Text} = require('react-native')

    return {
        ConfidenceBadge: ({nivel}) => ReactInterno.createElement(
            Text,
            {testID: 'confidence-badge'},
            nivel
        )
    }
})

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    InfoIcon: () => null
}))

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen/ButtonScreen', () => {
    const ReactInterno = require('react')
    const {Pressable, Text} = require('react-native')

    return function ButtonScreenMock({texto, aoPressionar}) {
        return ReactInterno.createElement(
            Pressable,
            {
                accessibilityRole: 'button',
                accessibilityLabel: texto,
                onPress: aoPressionar
            },
            ReactInterno.createElement(Text, null, texto)
        )
    }
})

jest.mock('../../../../src/shared/components/feedback/Modal/AlertModal/AlertModal', () => {
    const ReactInterno = require('react')
    const {Pressable, Text, View} = require('react-native')

    return function AlertModalMock({
        visivel,
        titulo,
        mensagem,
        acaoPrincipal
    }) {
        if (!visivel) return null

        return ReactInterno.createElement(
            View,
            {testID: 'alert-modal'},
            ReactInterno.createElement(Text, null, titulo),
            ReactInterno.createElement(Text, null, mensagem),
            ReactInterno.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: acaoPrincipal?.texto,
                    onPress: acaoPrincipal?.aoPressionar
                },
                ReactInterno.createElement(Text, null, acaoPrincipal?.texto)
            )
        )
    }
})

jest.mock('../../../../src/features/calendar/components/CycleCalendar/CycleCalendar', () => {
    const ReactInterno = require('react')
    const {Text, View} = require('react-native')

    return {
        CycleCalendar: ({carregando}) => ReactInterno.createElement(
            View,
            {testID: 'cycle-calendar'},
            ReactInterno.createElement(
                Text,
                null,
                carregando ? 'Carregando calendário' : 'Calendário pronto'
            )
        )
    }
})

jest.mock('../../../../src/features/calendar/components/CycleLegendSheet/CycleLegendSheet', () => {
    const ReactInterno = require('react')
    const {Pressable, Text, View} = require('react-native')

    return {
        CycleLegendSheet: ({visivel, aoFechar, itens}) => (
            visivel
                ? ReactInterno.createElement(
                    View,
                    {testID: 'cycle-legend-sheet'},
                    ReactInterno.createElement(Text, null, `Itens: ${itens.length}`),
                    ReactInterno.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Fechar legenda',
                            onPress: aoFechar
                        },
                        ReactInterno.createElement(Text, null, 'Fechar')
                    )
                )
                : null
        )
    }
})

describe('CalendarScreen', () => {
    test('mostra calendário, título e confiança', async () => {
        await render(
            <CalendarScreen
                meses={[{mes: '2026-10', possuiCiclos: true}]}
                confianca="alta"
                aoVoltar={jest.fn()}
            />
        )

        expect(screen.getByText('Calendário')).toBeOnTheScreen()
        expect(screen.getByTestId('cycle-calendar')).toBeOnTheScreen()
        expect(screen.getByTestId('confidence-badge')).toHaveTextContent('alta')
    })

    test('abre e fecha a legenda pelo botão de informação', async () => {
        await render(
            <CalendarScreen
                meses={[{mes: '2026-10', possuiCiclos: true}]}
                confianca="media"
                aoVoltar={jest.fn()}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {name: 'Abrir legenda do calendário'})
        )

        expect(await screen.findByText('Itens: 10')).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('button', {name: 'Fechar legenda'})
        )

        await waitFor(() => {
            expect(screen.queryByTestId('cycle-legend-sheet')).toBeNull()
        })
    })

    test('mostra o estado vazio e chama o atalho de cadastro', async () => {
        const aoCadastrarMenstruacao = jest.fn()

        await render(
            <CalendarScreen
                meses={[{mes: '2026-10', possuiCiclos: false}]}
                confianca="baixa"
                aoVoltar={jest.fn()}
                aoCadastrarMenstruacao={aoCadastrarMenstruacao}
            />
        )

        expect(
            screen.getByText('Você ainda não possui nenhum ciclo registrado. Toque em um dia no Calendário para começar.')
        ).toBeOnTheScreen()
        expect(screen.queryByTestId('confidence-badge')).toBeNull()

        await fireEvent.press(
            screen.getByRole('button', {name: 'Cadastrar Menstruação'})
        )

        expect(aoCadastrarMenstruacao).toHaveBeenCalledTimes(1)
    })

    test('mostra o erro e tenta carregar novamente', async () => {
        const aoTentarNovamente = jest.fn()

        await render(
            <CalendarScreen
                meses={[{mes: '2026-10', possuiCiclos: true}]}
                confianca="alta"
                erro="Não foi possível carregar os dados do calendário. Tente novamente."
                aoVoltar={jest.fn()}
                aoTentarNovamente={aoTentarNovamente}
            />
        )

        expect(screen.getByTestId('alert-modal')).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('button', {name: 'Tentar novamente'})
        )

        expect(aoTentarNovamente).toHaveBeenCalledTimes(1)
    })
})