//Testa o preenchimento progressivo das barras de confiabilidade.
import {render, screen} from '@testing-library/react-native'

import {ConfidenceStatusBar} from '../../../../src/shared/components/common/ConfidenceBadge/ConfidenceStatusBar'

function obterBarra(numero) {
    return screen.getByTestId(
        `confidence-status-bar-${numero}`,
        {
            includeHiddenElements: true
        }
    )
}

describe('ConfidenceStatusBar', () => {
    test.each([
        ['baixa', [1, 0.2, 0.2]],
        ['media', [1, 1, 0.2]],
        ['alta', [1, 1, 1]]
    ])('mostra corretamente o nível %s', async (nivel, opacidades) => {
        await render(
            <ConfidenceStatusBar
                nivel={nivel}
                cor="#2C4C3B"
            />
        )

        expect(obterBarra(1)).toHaveStyle({
            width: 4,
            height: 5,
            borderRadius: 4,
            backgroundColor: '#2C4C3B',
            opacity: opacidades[0]
        })

        expect(obterBarra(2)).toHaveStyle({
            width: 4,
            height: 9,
            borderRadius: 4,
            backgroundColor: '#2C4C3B',
            opacity: opacidades[1]
        })

        expect(obterBarra(3)).toHaveStyle({
            width: 4,
            height: 12,
            borderRadius: 4,
            backgroundColor: '#2C4C3B',
            opacity: opacidades[2]
        })
    })

    test('mantém as barras escondidas dos leitores de tela', async () => {
        const resultado = await render(
            <ConfidenceStatusBar
                nivel="alta"
                cor="#2C4C3B"
            />
        )

        expect(resultado.toJSON()).toMatchObject({
            props: {
                accessible: false,
                accessibilityElementsHidden: true,
                importantForAccessibility: 'no-hide-descendants'
            }
        })
    })

    test('rejeita um nível inválido', async () => {
        await expect(render(
            <ConfidenceStatusBar
                nivel="desconhecido"
                cor="#2C4C3B"
            />
        )).rejects.toThrow('Nível da barra de confiança inválido: desconhecido')
    })

    test.each([
        undefined,
        null,
        '',
        '   '
    ])('rejeita a cor inválida %p', async cor => {
        await expect(render(
            <ConfidenceStatusBar
                nivel="alta"
                cor={cor}
            />
        )).rejects.toThrow('A barra de confiança precisa receber uma cor.')
    })
})