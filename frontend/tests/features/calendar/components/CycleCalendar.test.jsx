//Testa carregamento, virtualização, paginação e interação do calendário.
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

import CycleCalendar from '../../../../src/features/calendar/components/CycleCalendar/CycleCalendar'

function criarMes(chave, alteracoes = {}) {
    return {
        mes: chave,
        possuiCiclos: true,
        diasMenstruacao: [],
        previsao: null,
        ...alteracoes
    }
}

describe('CycleCalendar', () => {
    test('mostra um indicador durante o carregamento inicial', async () => {
        await render(
            <CycleCalendar
                meses={[]}
                carregando
            />
        )

        expect(
            screen.getByLabelText('Carregando calendário')
        ).toBeOnTheScreen()

        expect(
            screen.queryByTestId('cycle-calendar-list')
        ).toBeNull()
    })

    test('mostra os dias da semana e ordena os meses', async () => {
        await render(
            <CycleCalendar
                meses={[
                    criarMes('2026-10'),
                    criarMes('2026-08'),
                    criarMes('2026-09')
                ]}
            />
        )

        expect(
            screen.getByRole('header', {
                name: 'Dias da semana'
            })
        ).toBeOnTheScreen()

        expect(screen.getByText('Dom')).toBeOnTheScreen()
        expect(screen.getByText('Sáb')).toBeOnTheScreen()

        const meses = screen.getAllByRole('header')
            .map((elemento) => elemento.props.accessibilityLabel)
            .filter((rotulo) => rotulo?.includes(' de 2026'))

        expect(meses).toEqual([
            'Agosto de 2026',
            'Setembro de 2026',
            'Outubro de 2026'
        ])
    })

    test('encaminha a abertura de um ciclo registrado', async () => {
        const aoPressionarDia = jest.fn()

        await render(
            <CycleCalendar
                meses={[
                    criarMes('2026-10', {
                        diasMenstruacao: [
                            {
                                data: '2026-10-01',
                                registroCicloId: 18
                            }
                        ]
                    })
                ]}
                aoPressionarDia={aoPressionarDia}
            />
        )

        fireEvent.press(
            screen.getByRole('button', {
                name: 'Dia 1 de outubro de 2026, menstruação registrada'
            })
        )

        expect(aoPressionarDia).toHaveBeenCalledWith({
            data: '2026-10-01',
            registroCicloId: 18
        })
    })

    test('não carrega meses anteriores antes da interação da usuária', async () => {
        const aoCarregarAnteriores = jest.fn()

        await render(
            <CycleCalendar
                meses={[criarMes('2026-10')]}
                aoCarregarAnteriores={aoCarregarAnteriores}
            />
        )

        fireEvent.scroll(
            screen.getByTestId('cycle-calendar-list'),
            {
                nativeEvent: {
                    contentOffset: {
                        y: 0
                    }
                }
            }
        )

        expect(aoCarregarAnteriores).not.toHaveBeenCalled()
    })

    test('carrega meses anteriores uma única vez perto do topo', async () => {
        const aoCarregarAnteriores = jest.fn()
        const lista = await render(
            <CycleCalendar
                meses={[
                    criarMes('2026-09'),
                    criarMes('2026-10')
                ]}
                aoCarregarAnteriores={aoCarregarAnteriores}
            />
        )

        const calendario = lista.getByTestId('cycle-calendar-list')

        fireEvent(calendario, 'scrollBeginDrag')

        fireEvent.scroll(calendario, {
            nativeEvent: {
                contentOffset: {
                    y: 80
                }
            }
        })

        fireEvent.scroll(calendario, {
            nativeEvent: {
                contentOffset: {
                    y: 40
                }
            }
        })

        expect(aoCarregarAnteriores).toHaveBeenCalledTimes(1)
    })

    test('carrega meses futuros somente após interação', async () => {
        const aoCarregarPosteriores = jest.fn()

        await render(
            <CycleCalendar
                meses={[criarMes('2026-10')]}
                aoCarregarPosteriores={aoCarregarPosteriores}
            />
        )

        const calendario = screen.getByTestId('cycle-calendar-list')

        fireEvent(calendario, 'endReached')

        expect(aoCarregarPosteriores).not.toHaveBeenCalled()

        fireEvent(calendario, 'scrollBeginDrag')
        fireEvent(calendario, 'endReached')
        fireEvent(calendario, 'endReached')

        expect(aoCarregarPosteriores).toHaveBeenCalledTimes(1)
    })

    test('mostra indicadores durante paginações', async () => {
        await render(
            <CycleCalendar
                meses={[criarMes('2026-10')]}
                carregandoAnteriores
                carregandoPosteriores
            />
        )

        expect(
            screen.getByLabelText('Carregando meses anteriores')
        ).toBeOnTheScreen()

        expect(
            screen.getByLabelText('Carregando próximos meses')
        ).toBeOnTheScreen()
    })

    test('tolera uma coleção inválida sem quebrar a tela', async () => {
        await render(<CycleCalendar meses={null} />)

        expect(
            screen.getByTestId('cycle-calendar-list')
        ).toBeOnTheScreen()
    })
})