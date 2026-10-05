//Mostra o nível de confiabilidade dos dados do ciclo em uma etiqueta colorida.
import {Text, View} from 'react-native'
import {estilos, variantes} from './ConfidenceBadge.styles'

const niveis = Object.freeze({
    alta: Object.freeze({
        rotulo: 'Alta',
        estilo: variantes.alta
    }),
    media: Object.freeze({
        rotulo: 'Média',
        estilo: variantes.media
    }),
    baixa: Object.freeze({
        rotulo: 'Baixa',
        estilo: variantes.baixa
    })
})

function ConfidenceBadge({nivel, exibirRotulo = true}) {
    const configuracao = niveis[nivel]

    if (!configuracao) {
        throw new Error(`Nível de confiança inválido: ${nivel}`)
    }

    const textoVisivel = exibirRotulo ? `Confiança ${configuracao.rotulo.toLowerCase()}` : configuracao.rotulo
    const rotuloAcessibilidade = `Confiança ${configuracao.rotulo.toLowerCase()}`

    return (
        <View
            accessible
            accessibilityRole="text"
            accessibilityLabel={rotuloAcessibilidade}
            style={[
                estilos.container,
                configuracao.estilo
            ]}
        >
            <Text
                numberOfLines={1}
                style={estilos.texto}
            >
                {textoVisivel}
            </Text>
        </View>
    )
}

export {ConfidenceBadge}