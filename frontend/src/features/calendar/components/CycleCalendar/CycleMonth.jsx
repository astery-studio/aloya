import React, {memo} from 'react'
import {Text, View} from 'react-native'
import {CycleWeek} from './CycleWeek'
import {estilos} from './CycleCalendar.styles'

function CycleMonthBase({mes, aoPressionarDia}) {
    if (!mes) {
        return null
    }

    return (
        <View accessibilityLabel={`${mes.nome} de ${mes.ano}`} style={estilos.mes}>
            <View style={estilos.cabecalhoMes}>
                <Text style={estilos.nomeMes}>{mes.nome}</Text>
                <Text style={estilos.anoMes}>{mes.ano}</Text>
            </View>
            {mes.semanas.map((semana, indice) => (
                <CycleWeek aoPressionarDia={aoPressionarDia} dias={semana} key={`${mes.chave}-semana-${indice}`} />
            ))}
            <View testID={`divisor-mes-${mes.chave}`} style={estilos.divisorMes} />
        </View>
    )
}

export const CycleMonth = memo(CycleMonthBase)