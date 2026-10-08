//Testa o cabeçalho, a grade e as interações de um mês completo.
import {fireEvent, render, screen} from '@testing-library/react-native'

import {CycleMonth} from '../../../../src/features/calendar/components/CycleCalendar/CycleMonth'
import {normalizarMes} from '../../../../src/features/calendar/utils/cycleCalendar.utils'

function criarMes(alteracoes = {}) {
    return normalizarMes({
        mes: '2026-10',
        possuiCiclos: true,
        diasMenstruacao: [],
        previsao: null,
        ...alteracoes
    }, '2026-10-03')
}

describe('CycleMonth', () => {
    test('mostra o nome, o ano e todos os dias do mês', async () => {
        await render(<CycleMonth mes={criarMes()} />)

        expect(
            screen.getByRole('header', {
                name: 'Outubro de 2026'
            })
        ).toBeOnTheScreen()

        expect(screen.getByText('Outubro')).toBeOnTheScreen()
        expect(screen.getByText('2026')).toBeOnTheScreen()
        expect(screen.getByText('1')).toBeOnTheScreen()
        expect(screen.getByText('31')).toBeOnTheScreen()
        expect(screen.getByTestId('mes-2026-10')).toBeOnTheScreen()
    })

    test('mostra cinco semanas para outubro de 2026', async () => {
        const mes = criarMes()
        const resultado = await render(<CycleMonth mes={mes} />)
        const arvore = resultado.toJSON()

        expect(mes.semanas).toHaveLength(5)
        expect(arvore.children).toHaveLength(6)
    })

    test('encaminha a edição de uma menstruação registrada', async () => {
        const aoPressionarDia = jest.fn()
        const mes = criarMes({
            diasMenstruacao: [
                {
                    data: '2026-10-01',
                    registroCicloId: 18
                }
            ]
        })

        await render(
            <CycleMonth
                mes={mes}
                aoPressionarDia={aoPressionarDia}
            />
        )

        fireEvent.press(
            screen.getByRole('button', {
                name: 'Dia 1 de outubro de 2026, menstruação registrada'
            })
        )

        expect(aoPressionarDia).toHaveBeenCalledTimes(1)
        expect(aoPressionarDia).toHaveBeenCalledWith({
            data: '2026-10-01',
            registroCicloId: 18
        })
    })

    test('não transforma previsões em botões', async () => {
        const aoPressionarDia = jest.fn()
        const mes = criarMes({
            previsao: {
                faseFolicular: {
                    inicio: '2026-10-04',
                    fim: '2026-10-06'
                }
            }
        })

        await render(
            <CycleMonth
                mes={mes}
                aoPressionarDia={aoPressionarDia}
            />
        )

        expect(
            screen.getByLabelText('Dia 4 de outubro de 2026, provável fase folicular')
        ).toBeOnTheScreen()

        expect(screen.queryByRole('button')).toBeNull()
        expect(aoPressionarDia).not.toHaveBeenCalled()
    })

    test('não quebra quando recebe um mês inválido', async () => {
        const resultado = await render(<CycleMonth mes={null} />)

        expect(resultado.toJSON()).toBeNull()
    })
})