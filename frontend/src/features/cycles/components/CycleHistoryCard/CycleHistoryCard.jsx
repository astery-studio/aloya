//Representa um ciclo registrado e mantém seus estados visuais consistentes no histórico.
import {Text, View} from 'react-native'

import {IconButton} from '../../../../shared/components/common/IconButton/IconButton'
import {ArrowsClockwiseIcon, NotePencilIcon, TrashIcon, WarningCircleIcon} from '../../../../shared/components/icons/AppIcons'
import {estilos} from './CycleHistoryCard.styles'

const estadosPermitidos = Object.freeze([
    'emAndamento',
    'concluido',
    'incerto'
])

function normalizarNumeroDoCiclo(valor) {
    if (!Number.isInteger(valor) || valor <= 0) {
        return '--'
    }

    return String(valor).padStart(2, '0')
}

function normalizarQuantidade(valor) {
    if (!Number.isInteger(valor) || valor < 0) {
        return null
    }

    return valor
}

function normalizarPeriodo(valor) {
    if (typeof valor !== 'string' || !valor.trim()) {
        return 'Período não informado'
    }

    return valor.trim()
}

function obterEstado(valor) {
    if (estadosPermitidos.includes(valor)) {
        return valor
    }

    return 'incerto'
}

function obterTextoDosDias(quantidade) {
    return quantidade === 1 ? '1 dia' : `${quantidade} dias`
}

function CycleHistoryCard({ciclo, aoEditar, aoExcluir}) {
    const cicloSeguro = ciclo && typeof ciclo === 'object' ? ciclo : {}
    const numero = normalizarNumeroDoCiclo(cicloSeguro.numero)
    const periodo = normalizarPeriodo(cicloSeguro.periodo)
    const diasMenstruais = normalizarQuantidade(cicloSeguro.diasMenstruais)
    const duracaoDias = normalizarQuantidade(cicloSeguro.duracaoDias)
    const estado = obterEstado(cicloSeguro.status)
    const estaEmAndamento = estado === 'emAndamento'
    const estimativaIncerta = estado === 'incerto'
    const duracaoDisponivel = !estaEmAndamento && duracaoDias !== null
    const rotuloDoCiclo = numero === '--' ? 'Ciclo sem número' : `Ciclo ${numero}`

    function editar() {
        if (typeof aoEditar === 'function') {
            aoEditar(ciclo)
        }
    }

    function excluir() {
        if (typeof aoExcluir === 'function') {
            aoExcluir(ciclo)
        }
    }

    return (
        <View
            testID="cycle-history-card"
            style={estilos.container}
        >
            <View style={[estilos.cabecalho, estaEmAndamento && estilos.cabecalhoEmAndamento]}>
                <View
                    accessible
                    accessibilityRole="text"
                    accessibilityLabel={rotuloDoCiclo}
                    style={estilos.numero}
                >
                    <Text style={estilos.textoDoNumero}>
                        {numero}
                    </Text>
                </View>

                <View style={estilos.textos}>
                    <Text
                        numberOfLines={2}
                        style={estilos.periodo}
                    >
                        {periodo}
                    </Text>

                    {estaEmAndamento ? (
                        <Text style={estilos.status}>
                            Em andamento
                        </Text>
                    ) : null}
                </View>

                <View style={estilos.acoes}>
                    <IconButton
                        icone={NotePencilIcon}
                        aoPressionar={typeof aoEditar === 'function' ? editar : undefined}
                        rotuloAcessibilidade={`Editar ${rotuloDoCiclo.toLowerCase()}`}
                        variante="neutro"
                    />

                    <IconButton
                        icone={TrashIcon}
                        aoPressionar={typeof aoExcluir === 'function' ? excluir : undefined}
                        rotuloAcessibilidade={`Excluir ${rotuloDoCiclo.toLowerCase()}`}
                        variante="neutro"
                    />
                </View>
            </View>

            <View style={estilos.separador} />

            <View style={estilos.indicadores}>
                <View
                    accessible
                    accessibilityRole="text"
                    accessibilityLabel={diasMenstruais === null ? 'Dias de menstruação não informados' : `${obterTextoDosDias(diasMenstruais)} de menstruação`}
                    style={[estilos.indicador, estilos.indicadorMenstruacao]}
                >
                    <Text style={[estilos.valorDoIndicador, estilos.textoMenstruacao]}>
                        {diasMenstruais === null ? '—' : obterTextoDosDias(diasMenstruais)}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[estilos.descricaoDoIndicador, estilos.textoMenstruacao]}
                    >
                        menstruação
                    </Text>
                </View>

                <View
                    accessible
                    accessibilityRole="text"
                    accessibilityLabel={duracaoDisponivel ? `${obterTextoDosDias(duracaoDias)} de ciclo` : 'Duração do ciclo ainda não disponível'}
                    style={[
                        estilos.indicador,
                        estilos.indicadorCiclo,
                        !duracaoDisponivel && estilos.indicadorIndisponivel
                    ]}
                >
                    <ArrowsClockwiseIcon
                        size={16}
                        color={duracaoDisponivel ? estilosCiclo.cor : estilosCiclo.corDesativada}
                        weight="regular"
                    />

                    <Text style={[
                        estilos.valorDoIndicador,
                        estilos.textoCiclo,
                        !duracaoDisponivel && estilos.textoIndisponivel
                    ]}>
                        {duracaoDisponivel ? obterTextoDosDias(duracaoDias) : '—'}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[
                            estilos.descricaoDoIndicador,
                            estilos.textoCiclo,
                            !duracaoDisponivel && estilos.textoIndisponivel
                        ]}
                    >
                        ciclo
                    </Text>
                </View>
            </View>

            {estimativaIncerta ? (
                <View
                    accessible
                    accessibilityRole="alert"
                    accessibilityLabel="Estimativa incerta. Os dados deste ciclo podem ser imprecisos."
                    style={estilos.aviso}
                >
                    <WarningCircleIcon
                        size={20}
                        color={estilosAviso.cor}
                        weight="fill"
                    />

                    <View style={estilos.textosDoAviso}>
                        <Text style={estilos.tituloDoAviso}>
                            Estimativa incerta
                        </Text>

                        <Text style={estilos.mensagemDoAviso}>
                            Os dados deste ciclo podem ser imprecisos.
                        </Text>
                    </View>
                </View>
            ) : null}
        </View>
    )
}

const estilosCiclo = Object.freeze({
    cor: '#2C4C3B',
    corDesativada: '#A9A9A6'
})

const estilosAviso = Object.freeze({
    cor: '#B97D22'
})

export {CycleHistoryCard}