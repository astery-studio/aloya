//Testa carregamento, virtualização, paginação e interação do calendário.
import {fireEvent, render} from '@testing-library/react-native'
import {CycleCalendar} from '../../../../src/features/calendar/components/CycleCalendar/CycleCalendar'

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
        const resultado = await render(<CycleCalendar meses={[]} carregando />)

        expect(resultado.getByLabelText('Carregando calendário')).toBeOnTheScreen()
        expect(resultado.queryByTestId('cycle-calendar-list')).toBeNull()
    })

    test('mostra os dias da semana e renderiza o mês atual e o anterior', async () => {
        const resultado = await render(
            <CycleCalendar
                meses={[
                    criarMes('2026-10'),
                    criarMes('2026-08'),
                    criarMes('2026-09')
                ]}
            />
        )

        expect(resultado.getByRole('header', {name: 'Dias da semana'})).toBeOnTheScreen()
        expect(resultado.getByText('Dom')).toBeOnTheScreen()
        expect(resultado.getByText('Sáb')).toBeOnTheScreen()

        const mesesRenderizados = resultado.getAllByRole('header')
            .map((elemento) => elemento.props.accessibilityLabel)
            .filter((rotulo) => rotulo?.includes(' de 2026'))

        expect(mesesRenderizados).toEqual(['Setembro de 2026', 'Outubro de 2026'])
        expect(resultado.queryByRole('header', {name: 'Agosto de 2026'})).toBeNull()
    })

    test('encaminha a abertura de um ciclo registrado', async () => {
        const aoPressionarDia = jest.fn()
        const resultado = await render(
            <CycleCalendar
                meses={[
                    criarMes('2026-10', {
                        diasMenstruacao: [{data: '2026-10-01', registroCicloId: 18}]
                    })
                ]}
                aoPressionarDia={aoPressionarDia}
            />
        )

        await fireEvent.press(
            resultado.getByRole('button', {
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
        const resultado = await render(
            <CycleCalendar
                meses={[criarMes('2026-10')]}
                aoCarregarAnteriores={aoCarregarAnteriores}
            />
        )

        await fireEvent.scroll(resultado.getByTestId('cycle-calendar-list'), {
            nativeEvent: {contentOffset: {y: 0}}
        })

        expect(aoCarregarAnteriores).not.toHaveBeenCalled()
    })

    test('carrega meses anteriores uma única vez perto do topo', async () => {
        const aoCarregarAnteriores = jest.fn()
        const resultado = await render(
            <CycleCalendar
                meses={[criarMes('2026-09'), criarMes('2026-10')]}
                aoCarregarAnteriores={aoCarregarAnteriores}
            />
        )

        const calendario = resultado.getByTestId('cycle-calendar-list')
        await fireEvent(calendario, 'scrollBeginDrag')
        await fireEvent.scroll(calendario, {nativeEvent: {contentOffset: {y: 80}}})
        await fireEvent.scroll(calendario, {nativeEvent: {contentOffset: {y: 40}}})

        expect(aoCarregarAnteriores).toHaveBeenCalledTimes(1)
    })

    test('carrega meses futuros somente após interação', async () => {
        const aoCarregarPosteriores = jest.fn()
        const resultado = await render(
            <CycleCalendar
                meses={[criarMes('2026-10')]}
                aoCarregarPosteriores={aoCarregarPosteriores}
            />
        )

        const calendario = resultado.getByTestId('cycle-calendar-list')
        await fireEvent(calendario, 'endReached')
        expect(aoCarregarPosteriores).not.toHaveBeenCalled()

        await fireEvent(calendario, 'scrollBeginDrag')
        await fireEvent(calendario, 'endReached')
        await fireEvent(calendario, 'endReached')

        expect(aoCarregarPosteriores).toHaveBeenCalledTimes(1)
    })

    test('mostra indicadores durante paginações', async () => {
        const resultado = await render(
            <CycleCalendar
                meses={[criarMes('2026-10')]}
                carregandoAnteriores
                carregandoPosteriores
            />
        )

        expect(resultado.getByLabelText('Carregando meses anteriores')).toBeOnTheScreen()
        expect(resultado.getByLabelText('Carregando próximos meses')).toBeOnTheScreen()
    })

    test('tolera uma coleção inválida sem quebrar a tela', async () => {
        const resultado = await render(<CycleCalendar meses={null} />)

        expect(resultado.getByTestId('cycle-calendar-list')).toBeOnTheScreen()
    })
})