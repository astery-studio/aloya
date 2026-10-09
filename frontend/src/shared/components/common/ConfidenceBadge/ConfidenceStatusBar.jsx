//Mostra três barras que representam visualmente o nível de confiabilidade.
import {View} from 'react-native'
import {estilos} from './ConfidenceStatusBar.styles'

const barras = Object.freeze([
    Object.freeze({
        id: 1,
        altura: 5
    }),
    Object.freeze({
        id: 2,
        altura: 9
    }),
    Object.freeze({
        id: 3,
        altura: 12
    })
])

const quantidadeDeBarrasAtivas = Object.freeze({
    baixa: 1,
    media: 2,
    alta: 3
})

function ConfidenceStatusBar({nivel, cor}) {
    const quantidadeAtiva = quantidadeDeBarrasAtivas[nivel]

    if (!quantidadeAtiva) {
        throw new Error(`Nível da barra de confiança inválido: ${nivel}`)
    }

    if (typeof cor !== 'string' || !cor.trim()) {
        throw new Error('A barra de confiança precisa receber uma cor.')
    }

    return (
        <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={estilos.container}
        >
            {barras.map((barra, indice) => (
                <View
                    key={barra.id}
                    testID={`confidence-status-bar-${barra.id}`}
                    style={[
                        estilos.barra,
                        {
                            height: barra.altura,
                            backgroundColor: cor,
                            opacity: indice < quantidadeAtiva ? 1 : 0.2
                        }
                    ]}
                />
            ))}
        </View>
    )
}

export {ConfidenceStatusBar}