//Mostra a confiabilidade dos dados do ciclo nas variantes simples ou composta.
import {Text, View} from 'react-native'

import {ChartLineUpIcon} from '../../icons/AppIcons'
import {ConfidenceStatusBar} from './ConfidenceStatusBar'
import {estilos, variantes} from './ConfidenceBadge.styles'

const niveis = Object.freeze({
    alta: Object.freeze({
        rotulo: 'Alta',
        visual: variantes.alta
    }),
    media: Object.freeze({
        rotulo: 'Média',
        visual: variantes.media
    }),
    baixa: Object.freeze({
        rotulo: 'Baixa',
        visual: variantes.baixa
    })
})

const variantesPermitidas = Object.freeze([
    'simples',
    'composta'
])

function ConfidenceBadge({nivel, variante = 'simples'}) {
    const configuracao = niveis[nivel]

    if (!configuracao) {
        throw new Error(`Nível de confiança inválido: ${nivel}`)
    }

    if (!variantesPermitidas.includes(variante)) {
        throw new Error(`Variante de confiança inválida: ${variante}`)
    }

    const {rotulo, visual} = configuracao
    const ehComposta = variante === 'composta'

    return (
        <View
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${ehComposta ? 'Confiabilidade' : 'Confiança'} ${rotulo.toLowerCase()}`}
            style={[
                estilos.container,
                ehComposta ? estilos.composta : estilos.simples,
                {
                    backgroundColor: visual.fundo,
                    borderColor: visual.borda
                }
            ]}
        >
            {ehComposta ? (
                <>
                    <View style={estilos.linha}>
                        <ChartLineUpIcon
                            size={16}
                            color={visual.cor}
                            weight="bold"
                        />

                        <Text
                            numberOfLines={1}
                            style={[
                                estilos.rotulo,
                                {
                                    color: visual.cor
                                }
                            ]}
                        >
                            CONFIABILIDADE
                        </Text>
                    </View>

                    <View style={estilos.linha}>
                        <ConfidenceStatusBar
                            nivel={nivel}
                            cor={visual.cor}
                        />

                        <Text
                            numberOfLines={1}
                            style={[
                                estilos.nivel,
                                {
                                    color: visual.cor
                                }
                            ]}
                        >
                            {rotulo}
                        </Text>
                    </View>
                </>
            ) : (
                <>
                    <View
                        style={[
                            estilos.ponto,
                            {
                                backgroundColor: visual.cor
                            }
                        ]}
                    />

                    <Text
                        numberOfLines={1}
                        style={[
                            estilos.textoSimples,
                            {
                                color: visual.cor
                            }
                        ]}
                    >
                        Confiança {rotulo}
                    </Text>
                </>
            )}
        </View>
    )
}

export {ConfidenceBadge}