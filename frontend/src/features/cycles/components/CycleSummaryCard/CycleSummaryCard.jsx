//Centraliza o resumo para manter os estados preenchido e vazio consistentes no histórico.
import {Text, View} from 'react-native'

import {ConfidenceBadge} from '../../../../shared/components/common/ConfidenceBadge/ConfidenceBadge'
import {estilos} from './CycleSummaryCard.styles'

const confiancasPermitidas = Object.freeze([
    'alta',
    'media',
    'baixa'
])

function normalizarQuantidade(valor) {
    if (!Number.isInteger(valor) || valor < 0) {
        return 0
    }

    return valor
}

function normalizarMetrica(valor) {
    if (!Number.isFinite(valor) || valor < 0) {
        return null
    }

    return valor
}

function obterTextoDosCiclos(quantidade) {
    return quantidade === 1 ? '1 ciclo registrado' : `${quantidade} ciclos registrados`
}

function CycleSummaryCard({cicloMedioDias, menstruacaoMediaDias, quantidadeCiclos, confianca}) {
    if (!confiancasPermitidas.includes(confianca)) {
        throw new Error(`Confiança do resumo de ciclos inválida: ${confianca}`)
    }

    const quantidadeSegura = normalizarQuantidade(quantidadeCiclos)
    const cicloMedioSeguro = normalizarMetrica(cicloMedioDias)
    const menstruacaoMediaSegura = normalizarMetrica(menstruacaoMediaDias)
    const temMetricas = quantidadeSegura > 0 && cicloMedioSeguro !== null && menstruacaoMediaSegura !== null

    return (
        <View
            testID="cycle-summary-card"
            style={[
                estilos.container,
                temMetricas ? estilos.comMetricas : estilos.semMetricas
            ]}
        >
            <View
                style={[
                    estilos.cabecalho,
                    temMetricas ? estilos.cabecalhoCentralizado : estilos.cabecalhoAlinhado
                ]}
            >
                <Text
                    accessibilityRole="header"
                    numberOfLines={1}
                    style={estilos.titulo}
                >
                    RESUMO DOS SEUS CICLOS
                </Text>
            </View>

            {temMetricas ? (
                <View
                    testID="cycle-summary-metrics"
                    style={estilos.metricas}
                >
                    <View
                        accessible
                        accessibilityRole="text"
                        accessibilityLabel={`Ciclo médio: ${cicloMedioSeguro} dias`}
                        style={[
                            estilos.metrica,
                            estilos.metricaComSeparador
                        ]}
                    >
                        <Text
                            numberOfLines={1}
                            style={estilos.rotuloMetrica}
                        >
                            Ciclo médio
                        </Text>

                        <View style={estilos.valorDaMetrica}>
                            <Text
                                numberOfLines={1}
                                style={estilos.numero}
                            >
                                {cicloMedioSeguro}
                            </Text>

                            <Text style={estilos.dias}>
                                dias
                            </Text>
                        </View>
                    </View>

                    <View
                        accessible
                        accessibilityRole="text"
                        accessibilityLabel={`Menstruação média: ${menstruacaoMediaSegura} dias`}
                        style={estilos.metrica}
                    >
                        <Text
                            numberOfLines={1}
                            style={estilos.rotuloMetrica}
                        >
                            Menstruação média
                        </Text>

                        <View style={estilos.valorDaMetrica}>
                            <Text
                                numberOfLines={1}
                                style={estilos.numero}
                            >
                                {menstruacaoMediaSegura}
                            </Text>

                            <Text style={estilos.dias}>
                                dias
                            </Text>
                        </View>
                    </View>
                </View>
            ) : null}

            <View style={estilos.rodape}>
                <Text
                    numberOfLines={1}
                    style={estilos.quantidade}
                >
                    {obterTextoDosCiclos(quantidadeSegura)}
                </Text>

                <ConfidenceBadge
                    nivel={confianca}
                    variante="simples"
                />
            </View>
        </View>
    )
}

export {CycleSummaryCard}