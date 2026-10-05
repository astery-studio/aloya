//Testa os níveis, formatos, ícones, textos e medidas da confiabilidade.
import {render, screen} from '@testing-library/react-native'

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    ChartBarIcon: jest.fn(() => null),
    ChartLineUpIcon: jest.fn(() => null)
}))

import {ChartBarIcon, ChartLineUpIcon} from '../../../../src/shared/components/icons/AppIcons'
import {ConfidenceBadge} from '../../../../src/shared/components/common/ConfidenceBadge/ConfidenceBadge'
import {estilos, variantes} from '../../../../src/shared/components/common/ConfidenceBadge/ConfidenceBadge.styles'

describe('ConfidenceBadge', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test.each([
        ['alta', 'Alta', variantes.alta],
        ['media', 'Média', variantes.media],
        ['baixa', 'Baixa', variantes.baixa]
    ])('mostra a versão completa do nível %s', async (nivel, rotulo, visual) => {
        await render(
            <ConfidenceBadge nivel={nivel} />
        )

        const componente = screen.getByLabelText(`Confiabilidade ${rotulo.toLowerCase()}`)

        expect(componente).toHaveStyle(estilos.completo)
        expect(componente).toHaveStyle({
            backgroundColor: visual.fundo,
            borderColor: visual.borda
        })
        expect(screen.getByText('CONFIABILIDADE')).toBeOnTheScreen()
        expect(screen.getByText(rotulo)).toBeOnTheScreen()
    })

    test.each([
        ['alta', 'Alta', variantes.alta],
        ['media', 'Média', variantes.media],
        ['baixa', 'Baixa', variantes.baixa]
    ])('mostra a versão compacta do nível %s', async (nivel, rotulo, visual) => {
        await render(
            <ConfidenceBadge
                nivel={nivel}
                exibirRotulo={false}
            />
        )

        const componente = screen.getByLabelText(`Confiabilidade ${rotulo.toLowerCase()}`)

        expect(componente).toHaveStyle(estilos.compacto)
        expect(componente).toHaveStyle({
            backgroundColor: visual.fundo
        })
        expect(screen.getByText(`Confiança ${rotulo}`)).toBeOnTheScreen()
        expect(screen.queryByText('CONFIABILIDADE')).not.toBeOnTheScreen()
    })

    test('usa os dois ícones na versão completa', async () => {
        await render(
            <ConfidenceBadge nivel="alta" />
        )

        expect(ChartLineUpIcon).toHaveBeenCalledWith(expect.objectContaining({
            size: 16,
            color: variantes.alta.cor,
            weight: 'bold'
        }), undefined)

        expect(ChartBarIcon).toHaveBeenCalledWith(expect.objectContaining({
            size: 18,
            color: variantes.alta.cor,
            weight: 'fill'
        }), undefined)
    })

    test('não carrega os ícones na versão compacta', async () => {
        await render(
            <ConfidenceBadge
                nivel="alta"
                exibirRotulo={false}
            />
        )

        expect(ChartLineUpIcon).not.toHaveBeenCalled()
        expect(ChartBarIcon).not.toHaveBeenCalled()
    })

    test('mantém as medidas da versão completa do Figma', async () => {
        await render(
            <ConfidenceBadge nivel="media" />
        )

        expect(screen.getByLabelText('Confiabilidade média')).toHaveStyle({
            width: 140.33,
            height: 59.33,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 0.666667,
            borderRadius: 16
        })
    })

    test('mantém as medidas da versão compacta do Figma', async () => {
        await render(
            <ConfidenceBadge
                nivel="alta"
                exibirRotulo={false}
            />
        )

        expect(screen.getByLabelText('Confiabilidade alta')).toHaveStyle({
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

        expect(screen.getByText('Confiança Alta')).toHaveStyle({
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 18
        })
    })

    test.each([
        undefined,
        null,
        '',
        'muito-alta',
        'MEDIA'
    ])('rejeita o nível inválido %p', async nivel => {
        await expect(render(
            <ConfidenceBadge nivel={nivel} />
        )).rejects.toThrow(`Nível de confiança inválido: ${nivel}`)
    })
})