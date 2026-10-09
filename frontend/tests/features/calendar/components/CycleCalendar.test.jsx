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
    test('carrega próximos meses no primeiro gesto mesmo quando o fim foi notificado na montagem', async () => {
        const aoCarregarPosteriores = jest.fn()
        const resultado = await render(<CycleCalendar meses={[criarMes('2026-10')]} aoCarregarPosteriores={aoCarregarPosteriores} />)
        const lista = resultado.getByTestId('cycle-calendar-list')
        const evento = {nativeEvent: {
            contentOffset: {y: 400}, contentSize: {height: 1000}, layoutMeasurement: {height: 600}
        }}

        //A lista nativa não repete onEndReached enquanto a usuária continua nesta borda.
        await fireEvent(lista, 'endReached')
        await fireEvent.scroll(lista, evento)
        expect(aoCarregarPosteriores).not.toHaveBeenCalled()
        await fireEvent(lista, 'scrollBeginDrag', evento)
        expect(aoCarregarPosteriores).toHaveBeenCalledTimes(1)
        await fireEvent.scroll(lista, evento)
        await fireEvent(lista, 'endReached')
        expect(aoCarregarPosteriores).toHaveBeenCalledTimes(1)
    })

    test('verifica o fim durante a rolagem sem carregar quando ainda está longe', async () => {
        const aoCarregarPosteriores = jest.fn()
        const resultado = await render(<CycleCalendar meses={[criarMes('2026-10')]} aoCarregarPosteriores={aoCarregarPosteriores} />)
        const lista = resultado.getByTestId('cycle-calendar-list')
        const evento = (y) => ({nativeEvent: {
            contentOffset: {y}, contentSize: {height: 1000}, layoutMeasurement: {height: 600}
        }})
        await fireEvent(lista, 'scrollBeginDrag', evento(100))
        await fireEvent.scroll(lista, evento(200))
        expect(aoCarregarPosteriores).not.toHaveBeenCalled()
        await fireEvent.scroll(lista, evento(350))
        expect(aoCarregarPosteriores).toHaveBeenCalledTimes(1)
    })

    test('permite carregar no primeiro gesto com conteúdo menor que a tela', async () => {
        const aoCarregarPosteriores = jest.fn()
        const resultado = await render(<CycleCalendar meses={[criarMes('2026-10')]} aoCarregarPosteriores={aoCarregarPosteriores} />)
        await fireEvent(resultado.getByTestId('cycle-calendar-list'), 'scrollBeginDrag', {nativeEvent: {
            contentOffset: {y: 0}, contentSize: {height: 330}, layoutMeasurement: {height: 600}
        }})
        expect(aoCarregarPosteriores).toHaveBeenCalledTimes(1)
    })

    test('inclui o indicador anterior nos offsets da lista sem trocar a âncora do cabeçalho', async () => {
        const meses = [criarMes('2026-09'), criarMes('2026-10')]
        const resultado = await render(<CycleCalendar meses={meses} />)
        const obterLista = () => resultado.getByTestId('cycle-calendar-list').props
        const antes = obterLista().getItemLayout(null, 1)
        expect(obterLista().ListHeaderComponent).not.toBeNull()

        await resultado.rerender(<CycleCalendar meses={meses} carregandoAnteriores />)

        expect(obterLista().getItemLayout(null, 0).offset).toBe(44)
        expect(obterLista().getItemLayout(null, 1)).toEqual({...antes, offset: antes.offset + 44})
        expect(resultado.getByLabelText('Carregando meses anteriores')).toBeOnTheScreen()

        await resultado.rerender(<CycleCalendar meses={meses} />)
        expect(obterLista().getItemLayout(null, 1)).toEqual(antes)
        expect(obterLista().ListHeaderComponent).not.toBeNull()
        expect(resultado.queryByLabelText('Carregando meses anteriores')).toBeNull()
    })

    test('continua paginando ao alcançar a nova borda sem exigir outro gesto', async () => {
        const aoCarregarPosteriores = jest.fn()
        const outubro = criarMes('2026-10')
        const novembro = criarMes('2026-11')
        const resultado = await render(<CycleCalendar meses={[outubro]} aoCarregarPosteriores={aoCarregarPosteriores} />)
        const lista = () => resultado.getByTestId('cycle-calendar-list')
        await fireEvent(lista(), 'scrollBeginDrag')
        await fireEvent(lista(), 'endReached')
        await fireEvent(lista(), 'endReached')
        expect(aoCarregarPosteriores).toHaveBeenCalledTimes(1)

        await resultado.rerender(<CycleCalendar meses={[outubro]} carregandoPosteriores aoCarregarPosteriores={aoCarregarPosteriores} />)
        await fireEvent(lista(), 'endReached')
        expect(aoCarregarPosteriores).toHaveBeenCalledTimes(1)

        await resultado.rerender(<CycleCalendar meses={[outubro, novembro]} aoCarregarPosteriores={aoCarregarPosteriores} />)
        await fireEvent(lista(), 'endReached')
        await fireEvent(lista(), 'endReached')
        expect(aoCarregarPosteriores).toHaveBeenCalledTimes(2)
    })

    test('continua carregando anteriores quando a borda muda durante a rolagem', async () => {
        const aoCarregarAnteriores = jest.fn()
        const outubro = criarMes('2026-10')
        const resultado = await render(<CycleCalendar meses={[outubro]} aoCarregarAnteriores={aoCarregarAnteriores} />)
        const lista = () => resultado.getByTestId('cycle-calendar-list')
        await fireEvent(lista(), 'scrollBeginDrag')
        await fireEvent.scroll(lista(), {nativeEvent: {contentOffset: {y: 40}}})
        expect(aoCarregarAnteriores).toHaveBeenCalledTimes(1)

        await resultado.rerender(<CycleCalendar meses={[criarMes('2026-09'), outubro]} aoCarregarAnteriores={aoCarregarAnteriores} />)
        await fireEvent.scroll(lista(), {nativeEvent: {contentOffset: {y: 40}}})
        await fireEvent.scroll(lista(), {nativeEvent: {contentOffset: {y: 20}}})
        expect(aoCarregarAnteriores).toHaveBeenCalledTimes(2)
    })

    test('mostra um indicador durante o carregamento inicial', async () => {
        const resultado = await render(<CycleCalendar meses={[]} carregando />)

        expect(resultado.getByLabelText('Carregando calendário')).toBeOnTheScreen()
        expect(resultado.queryByTestId('cycle-calendar-list')).toBeNull()
    })

    test('mostra os dias da semana e inicia no mês atual', async () => {
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

        expect(mesesRenderizados).toEqual(['Outubro de 2026'])
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
