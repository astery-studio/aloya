//Testa os níveis, as variantes e a acessibilidade da tag de confiabilidade.
import {render, screen} from '@testing-library/react-native'

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    ChartLineUpIcon: jest.fn(() => null)
}))

jest.mock('../../../../src/shared/components/common/ConfidenceBadge/ConfidenceStatusBar', () => ({
    ConfidenceStatusBar: jest.fn(() => null)
}))

import {ChartLineUpIcon} from '../../../../src/shared/components/icons/AppIcons'
import {ConfidenceBadge} from '../../../../src/shared/components/common/ConfidenceBadge/ConfidenceBadge'
import {ConfidenceStatusBar} from '../../../../src/shared/components/common/ConfidenceBadge/ConfidenceStatusBar'
import {estilos, variantes} from '../../../../src/shared/components/common/ConfidenceBadge/ConfidenceBadge.styles'

describe('ConfidenceBadge', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test.each([
        ['alta', 'Alta', variantes.alta],
        ['media', 'Média', variantes.media],
        ['baixa', 'Baixa', variantes.baixa]
    ])('mostra a variante simples do nível %s', async (nivel, rotulo, visual) => {
        await render(
            <ConfidenceBadge nivel={nivel} />
        )

        const componente = screen.getByLabelText(`Confiança ${rotulo.toLowerCase()}`)

        expect(componente).toHaveStyle(estilos.simples)
        expect(componente).toHaveStyle({
            backgroundColor: visual.fundo
        })
        expect(screen.getByText(`Confiança ${rotulo}`)).toBeOnTheScreen()
        expect(screen.queryByText('CONFIABILIDADE')).not.toBeOnTheScreen()
    })

    test.each([
        ['alta', 'Alta', variantes.alta],
        ['media', 'Média', variantes.media],
        ['baixa', 'Baixa', variantes.baixa]
    ])('mostra a variante composta do nível %s', async (nivel, rotulo, visual) => {
        await render(
            <ConfidenceBadge
                nivel={nivel}
                variante="composta"
            />
        )

        const componente = screen.getByLabelText(`Confiabilidade ${rotulo.toLowerCase()}`)

        expect(componente).toHaveStyle(estilos.composta)
        expect(componente).toHaveStyle({
            backgroundColor: visual.fundo,
            borderColor: visual.borda
        })
        expect(screen.getByText('CONFIABILIDADE')).toBeOnTheScreen()
        expect(screen.getByText(rotulo)).toBeOnTheScreen()
        expect(ConfidenceStatusBar).toHaveBeenCalledWith(expect.objectContaining({
            nivel,
            cor: visual.cor
        }), undefined)
    })

    test('usa o ícone de tendência somente na variante composta', async () => {
        await render(
            <ConfidenceBadge
                nivel="alta"
                variante="composta"
            />
        )

        expect(ChartLineUpIcon).toHaveBeenCalledWith(expect.objectContaining({
            size: 16,
            color: variantes.alta.cor,
            weight: 'bold'
        }), undefined)
    })

    test('não carrega os componentes compostos na variante simples', async () => {
        await render(
            <ConfidenceBadge nivel="alta" />
        )

        expect(ChartLineUpIcon).not.toHaveBeenCalled()
        expect(ConfidenceStatusBar).not.toHaveBeenCalled()
    })

    test('mantém as medidas da variante simples', async () => {
        await render(
            <ConfidenceBadge nivel="alta" />
        )

        expect(screen.getByLabelText('Confiança alta')).toHaveStyle({
            height: 24,
            gap: 5,
            paddingVertical: 3,
            paddingHorizontal: 10,
            borderRadius: 999
        })

        expect(estilos.ponto).toMatchObject({
            width: 5.99,
            height: 5.99,
            borderRadius: 2.99578
        })
    })

    test('mantém as medidas da variante composta', async () => {
        await render(
            <ConfidenceBadge
                nivel="baixa"
                variante="composta"
            />
        )

        expect(screen.getByLabelText('Confiabilidade baixa')).toHaveStyle({
            width: 140.33,
            height: 59.33,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 0.666667,
            borderRadius: 16
        })
    })

    test.each([
        undefined,
        null,
        '',
        'desconhecida'
    ])('rejeita o nível inválido %p', async nivel => {
        await expect(render(
            <ConfidenceBadge nivel={nivel} />
        )).rejects.toThrow(`Nível de confiança inválido: ${nivel}`)
    })

    test.each([
        '',
        'compacta',
        'completa',
        'desconhecida'
    ])('rejeita a variante inválida %p', async variante => {
        await expect(render(
            <ConfidenceBadge
                nivel="alta"
                variante={variante}
            />
        )).rejects.toThrow(`Variante de confiança inválida: ${variante}`)
    })
})