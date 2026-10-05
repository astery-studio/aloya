//Mostra a confiabilidade dos dados do ciclo nas versões completa ou compacta.
import {Text, View} from 'react-native'

import {ChartBarIcon, ChartLineUpIcon} from '../../icons/AppIcons'
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

function ConfidenceBadge({nivel, exibirRotulo = true}) {
    const configuracao = niveis[nivel]

    if (!configuracao) {
        throw new Error(`Nível de confiança inválido: ${nivel}`)
    }

    const {rotulo, visual} = configuracao
    const estiloDasCores = {
        backgroundColor: visual.fundo,
        borderColor: visual.borda
    }

    return (
        <View
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Confiabilidade ${rotulo.toLowerCase()}`}
            style={[
                estilos.container,
                exibirRotulo ? estilos.completo : estilos.compacto,
                estiloDasCores
            ]}
        >
            {exibirRotulo ? (
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
                        <ChartBarIcon
                            size={18}
                            color={visual.cor}
                            weight="fill"
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
                            estilos.textoCompacto,
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