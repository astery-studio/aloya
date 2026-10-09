//Garante que dados incompletos nunca produzam um resumo parcialmente preenchido.
import {render, screen} from '@testing-library/react-native'

import {CycleSummaryCard} from '../../../../src/features/cycles/components/CycleSummaryCard/CycleSummaryCard'
import {estilos} from '../../../../src/features/cycles/components/CycleSummaryCard/CycleSummaryCard.styles'

describe('CycleSummaryCard', () => {
    test('mostra as duas médias quando existem ciclos e métricas válidas', async () => {
        await render(
            <CycleSummaryCard
                cicloMedioDias={28}
                menstruacaoMediaDias={5}
                quantidadeCiclos={5}
                confianca="alta"
            />
        )

        expect(screen.getByTestId('cycle-summary-card')).toHaveStyle(estilos.comMetricas)
        expect(screen.getByText('RESUMO DOS SEUS CICLOS')).toBeOnTheScreen()
        expect(screen.getByLabelText('Ciclo médio: 28 dias')).toBeOnTheScreen()
        expect(screen.getByLabelText('Menstruação média: 5 dias')).toBeOnTheScreen()
        expect(screen.getByText('5 ciclos registrados')).toBeOnTheScreen()
        expect(screen.getByLabelText('Confiança alta')).toBeOnTheScreen()
    })

    test('mantém somente quantidade e confiança quando não existem ciclos', async () => {
        await render(
            <CycleSummaryCard
                quantidadeCiclos={0}
                confianca="baixa"
            />
        )

        expect(screen.getByTestId('cycle-summary-card')).toHaveStyle(estilos.semMetricas)
        expect(screen.queryByTestId('cycle-summary-metrics')).not.toBeOnTheScreen()
        expect(screen.getByText('0 ciclos registrados')).toBeOnTheScreen()
        expect(screen.getByLabelText('Confiança baixa')).toBeOnTheScreen()
    })

    test('não mostra métricas quando somente uma média foi informada', async () => {
        await render(
            <CycleSummaryCard
                cicloMedioDias={28}
                quantidadeCiclos={5}
                confianca="media"
            />
        )

        expect(screen.queryByTestId('cycle-summary-metrics')).not.toBeOnTheScreen()
        expect(screen.getByTestId('cycle-summary-card')).toHaveStyle(estilos.semMetricas)
        expect(screen.getByText('5 ciclos registrados')).toBeOnTheScreen()
    })

    test('não mostra métricas quando a quantidade de ciclos é zero', async () => {
        await render(
            <CycleSummaryCard
                cicloMedioDias={28}
                menstruacaoMediaDias={5}
                quantidadeCiclos={0}
                confianca="media"
            />
        )

        expect(screen.queryByTestId('cycle-summary-metrics')).not.toBeOnTheScreen()
        expect(screen.getByText('0 ciclos registrados')).toBeOnTheScreen()
    })

    test('usa o singular quando existe somente um ciclo', async () => {
        await render(
            <CycleSummaryCard
                cicloMedioDias={28}
                menstruacaoMediaDias={5}
                quantidadeCiclos={1}
                confianca="alta"
            />
        )

        expect(screen.getByText('1 ciclo registrado')).toBeOnTheScreen()
    })

    test.each([
        undefined,
        null,
        -1,
        1.5,
        '5',
        Number.NaN
    ])('normaliza a quantidade inválida %p para zero', async quantidadeCiclos => {
        await render(
            <CycleSummaryCard
                quantidadeCiclos={quantidadeCiclos}
                confianca="baixa"
            />
        )

        expect(screen.getByText('0 ciclos registrados')).toBeOnTheScreen()
        expect(screen.queryByTestId('cycle-summary-metrics')).not.toBeOnTheScreen()
    })

    test.each([
        [-1, 5],
        [28, -1],
        [Number.NaN, 5],
        [28, Number.POSITIVE_INFINITY],
        ['28', 5],
        [28, '5']
    ])('oculta as métricas quando recebe valores inválidos %p e %p', async (cicloMedioDias, menstruacaoMediaDias) => {
        await render(
            <CycleSummaryCard
                cicloMedioDias={cicloMedioDias}
                menstruacaoMediaDias={menstruacaoMediaDias}
                quantidadeCiclos={5}
                confianca="media"
            />
        )

        expect(screen.queryByTestId('cycle-summary-metrics')).not.toBeOnTheScreen()
        expect(screen.getByTestId('cycle-summary-card')).toHaveStyle(estilos.semMetricas)
    })

    test.each([
        undefined,
        null,
        '',
        'muito-alta',
        'ALTA'
    ])('rejeita a confiança inválida %p', async confianca => {
        await expect(render(
            <CycleSummaryCard
                quantidadeCiclos={0}
                confianca={confianca}
            />
        )).rejects.toThrow(`Confiança do resumo de ciclos inválida: ${confianca}`)
    })

    test('mantém as medidas das duas variantes do protótipo', async () => {
        const resultado = await render(
            <CycleSummaryCard
                cicloMedioDias={28}
                menstruacaoMediaDias={5}
                quantidadeCiclos={5}
                confianca="alta"
            />
        )

        expect(screen.getByTestId('cycle-summary-card')).toHaveStyle({
            width: '100%',
            maxWidth: 350,
            height: 210.4,
            borderWidth: 1.41,
            borderRadius: 16
        })

        await resultado.rerender(
            <CycleSummaryCard
                quantidadeCiclos={0}
                confianca="baixa"
            />
        )

        expect(screen.getByTestId('cycle-summary-card')).toHaveStyle({
            width: '100%',
            maxWidth: 350,
            height: 100
        })
    })
})