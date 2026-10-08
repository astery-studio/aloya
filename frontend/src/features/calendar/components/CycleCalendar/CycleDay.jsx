import React, {memo} from 'react'
import {Pressable, Text, View} from 'react-native'
import {DropIcon} from 'phosphor-react-native/src/icons/Drop'
import {FlowerLotusIcon} from 'phosphor-react-native/src/icons/FlowerLotus'
import {LeafIcon} from 'phosphor-react-native/src/icons/Leaf'
import {WavesIcon} from 'phosphor-react-native/src/icons/Waves'
import {TIPOS_DIA} from '../../utils/cycleCalendar.utils'
import {estilos} from './CycleCalendar.styles'

const ICONES_POR_TIPO = Object.freeze({
    [TIPOS_DIA.menstruacao]: DropIcon,
    [TIPOS_DIA.folicular]: LeafIcon,
    [TIPOS_DIA.ovulatoria]: FlowerLotusIcon,
    [TIPOS_DIA.lutea]: WavesIcon
})

const ESTILOS_POR_TIPO = Object.freeze({
    [TIPOS_DIA.menstruacao]: {
        atual: estilos.menstruacaoAtual,
        previsto: estilos.menstruacaoPrevista
    },
    [TIPOS_DIA.folicular]: {
        atual: estilos.folicularAtual,
        previsto: estilos.folicularPrevista
    },
    [TIPOS_DIA.ovulatoria]: {
        atual: estilos.ovulatoriaAtual,
        previsto: estilos.ovulatoriaPrevista
    },
    [TIPOS_DIA.lutea]: {
        atual: estilos.luteaAtual,
        previsto: estilos.luteaPrevista
    }
})

function ConteudoDia({dia}) {
    const Icone = ICONES_POR_TIPO[dia.tipo]

    return (
        <View style={estilos.conteudoDia}>
            {Icone ? (
                <View style={estilos.containerIconeDia}>
                    <Icone color="#FFFFFF" size={10.992} weight={dia.tipo === TIPOS_DIA.menstruacao ? 'fill' : 'regular'} />
                </View>
            ) : null}
            <Text style={dia.tipo ? estilos.numeroDiaMarcado : [estilos.numeroDia, dia.futuro && estilos.numeroDiaFuturo]}>{dia.numero}</Text>
        </View>
    )
}

function CycleDayBase({dia, aoPressionarDia}) {
    if (!dia) {
        return <View style={estilos.celulaDia} />
    }

    const podeEditar = Boolean(dia.editavel && dia.registroCicloId != null && typeof aoPressionarDia === 'function')
    const estilosTipo = ESTILOS_POR_TIPO[dia.tipo]
    const estiloMarcacao = estilosTipo ? estilosTipo[dia.previsto ? 'previsto' : 'atual'] : null
    const rotulo = dia.editavel ? `Dia ${dia.numero} de ${dia.rotuloMes}, menstruação registrada` : `Dia ${dia.numero} de ${dia.rotuloMes}`

    return (
        <Pressable accessibilityLabel={rotulo} accessibilityRole={podeEditar ? 'button' : 'text'} disabled={!podeEditar} onPress={podeEditar ? () => aoPressionarDia(dia) : undefined} style={estilos.celulaDia}>
            {dia.tipo ? (
                <View
                    pointerEvents="none"
                    style={[
                        estilos.segmentoDia,
                        estiloMarcacao,
                        dia.inicioSegmento && estilos.inicioSegmento,
                        dia.fimSegmento && estilos.fimSegmento,
                        dia.previsto && estilos.segmentoPrevisto
                    ]}
                />
            ) : null}
            <ConteudoDia dia={dia} />
        </Pressable>
    )
}

export const CycleDay = memo(CycleDayBase)