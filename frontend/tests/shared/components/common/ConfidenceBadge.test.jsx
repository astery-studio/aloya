//Testa os textos, as cores e a acessibilidade da etiqueta de confiabilidade.
import {render, screen} from '@testing-library/react-native'

import {tema} from '../../../../src/shared/theme'
import {ConfidenceBadge} from '../../../../src/shared/components/common/ConfidenceBadge/ConfidenceBadge'
import {estilos, variantes} from '../../../../src/shared/components/common/ConfidenceBadge/ConfidenceBadge.styles'

describe('ConfidenceBadge', () => {
    test('mostra a confiança alta em verde', async () => {
        await render(
            <ConfidenceBadge nivel="alta" />
        )

        const etiqueta = screen.getByLabelText('Confiança alta')

        expect(etiqueta).toHaveStyle(estilos.container)
        expect(etiqueta).toHaveStyle(variantes.alta)
        expect(etiqueta).toHaveStyle({
            backgroundColor: tema.cores.marca.secundaria
        })
        expect(screen.getByText('Confiança alta')).toBeOnTheScreen()
    })

    test('mostra a confiança média em laranja', async () => {
        await render(
            <ConfidenceBadge nivel="media" />
        )

        const etiqueta = screen.getByLabelText('Confiança média')

        expect(etiqueta).toHaveStyle(variantes.media)
        expect(etiqueta).toHaveStyle({
            backgroundColor: tema.cores.feedback.aviso
        })
        expect(screen.getByText('Confiança média')).toBeOnTheScreen()
    })

    test('mostra a confiança baixa em vermelho', async () => {
        await render(
            <ConfidenceBadge nivel="baixa" />
        )

        const etiqueta = screen.getByLabelText('Confiança baixa')

        expect(etiqueta).toHaveStyle(variantes.baixa)
        expect(etiqueta).toHaveStyle({
            backgroundColor: tema.cores.marca.primaria
        })
        expect(screen.getByText('Confiança baixa')).toBeOnTheScreen()
    })

    test.each([
        ['alta', 'Alta'],
        ['media', 'Média'],
        ['baixa', 'Baixa']
    ])('esconde o prefixo visual no nível %s', async (nivel, textoEsperado) => {
        await render(
            <ConfidenceBadge
                nivel={nivel}
                exibirRotulo={false}
            />
        )

        expect(screen.getByText(textoEsperado)).toBeOnTheScreen()
        expect(screen.queryByText(`Confiança ${textoEsperado.toLowerCase()}`)).not.toBeOnTheScreen()
    })

    test('mantém o contexto completo para acessibilidade quando esconde o prefixo', async () => {
        await render(
            <ConfidenceBadge
                nivel="alta"
                exibirRotulo={false}
            />
        )

        expect(screen.getByLabelText('Confiança alta')).toBeOnTheScreen()
    })

    test('usa o estilo tipográfico centralizado do tema', async () => {
        await render(
            <ConfidenceBadge nivel="alta" />
        )

        expect(screen.getByText('Confiança alta')).toHaveStyle({
            color: tema.cores.neutras.superficieClara,
            fontFamily: tema.typography.micro.fontFamily,
            fontSize: tema.typography.micro.fontSize,
            fontWeight: tema.typography.micro.fontWeight
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