import React from 'react'
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react-native'
import {CalendarScreen} from '../../../../src/features/calendar/screens/CalendarScreen'
import {estilos} from '../../../../src/features/calendar/screens/CalendarScreen.styles'

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
    ArrowLeftIcon: () => null,
    InfoIcon: () => null
}))

jest.mock('../../../../src/shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar', () => {
    const ReactInterno = require('react')
    const {View} = require('react-native')

    return {
        BottomTabBar: () => ReactInterno.createElement(View, {testID: 'bottom-tab-bar'})
    }
})

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

    return function AlertModalMock({visivel, titulo, mensagem, acaoPrincipal}) {
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
                            accessibilityLabel: 'Fechar painel',
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
        const tituloEConfianca = within(screen.getByTestId('titulo-e-confianca'))
        expect(tituloEConfianca.getByText('Calendário')).toBeOnTheScreen()
        expect(tituloEConfianca.getByTestId('confidence-badge')).toBeOnTheScreen()
        expect(estilos.centralizadorCabecalho).toMatchObject({
            position: 'absolute',
            left: 0,
            right: 0,
            alignItems: 'center'
        })
        expect(estilos.caixaCalendario).toMatchObject({
            width: 288
        })
        expect(estilos.tituloEConfianca).toMatchObject({
            flexDirection: 'column',
            alignItems: 'center'
        })
        expect(screen.getByTestId('centralizador-confianca')).toHaveStyle({
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center'
        })
        //O grupo inteiro precisa caber antes do cabeçalho dos dias da semana.
        const fimDoGrupo = estilos.centralizadorCabecalho.top + estilos.caixaCalendario.height
        expect(fimDoGrupo + estilos.cabecalho.paddingBottom).toBeLessThanOrEqual(
            estilos.cabecalho.height
        )
        expect(screen.getByTestId('bottom-tab-bar')).toBeOnTheScreen()
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
            screen.getByRole('button', {name: 'Fechar painel'})
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

    test('reabre o mesmo erro após uma nova falha, sem reabrir o erro já dispensado', async () => {
        const props = {
            meses: [{mes: '2026-10', possuiCiclos: true}],
            confianca: 'alta',
            aoVoltar: jest.fn()
        }
        const mensagem = 'Não foi possível carregar os dados do calendário. Tente novamente.'
        const {rerender} = await render(<CalendarScreen {...props} erro={mensagem} />)

        await fireEvent.press(screen.getByRole('button', {name: 'Fechar'}))
        expect(screen.queryByTestId('alert-modal')).toBeNull()
        await rerender(<CalendarScreen {...props} erro={mensagem} />)
        expect(screen.queryByTestId('alert-modal')).toBeNull()

        await rerender(<CalendarScreen {...props} />)
        await rerender(<CalendarScreen {...props} erro={mensagem} />)
        expect(screen.getByTestId('alert-modal')).toBeOnTheScreen()
    })
})
