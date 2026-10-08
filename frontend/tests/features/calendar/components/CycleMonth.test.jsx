import React from 'react'
import {render, screen} from '@testing-library/react-native'
import {CycleMonth} from '../../../../src/features/calendar/components/CycleCalendar/CycleMonth'
import {estilos} from '../../../../src/features/calendar/components/CycleCalendar/CycleCalendar.styles'
import {normalizarMes} from '../../../../src/features/calendar/utils/cycleCalendar.utils'

const mes = normalizarMes({
    ano: 2026,
    mes: 10,
    dias: []
})

describe('CycleMonth', () => {
    test('mostra o cabeçalho do mês com mês e ano separados', () => {
        render(<CycleMonth mes={mes} />)

        expect(screen.getByText('Outubro')).toHaveStyle(estilos.nomeMes)
        expect(screen.getByText('2026')).toHaveStyle(estilos.anoMes)
    })

    test('monta todas as semanas necessárias para o mês', () => {
        render(<CycleMonth mes={mes} />)

        expect(mes.semanas).toHaveLength(5)
        expect(screen.getByLabelText('Dia 1 de Outubro de 2026')).toBeOnTheScreen()
        expect(screen.getByLabelText('Dia 31 de Outubro de 2026')).toBeOnTheScreen()
    })

    test('mostra a divisão visual depois da grade mensal', () => {
        render(<CycleMonth mes={mes} />)

        expect(screen.getByTestId('divisor-mes-2026-10')).toHaveStyle(estilos.divisorMes)
    })

    test('não renderiza conteúdo quando o mês é inválido', () => {
        const {toJSON} = render(<CycleMonth mes={null} />)

        expect(toJSON()).toBeNull()
    })
})