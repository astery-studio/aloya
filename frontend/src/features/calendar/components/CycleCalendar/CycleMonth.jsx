//Mostra um mês completo usando semanas previamente normalizadas.
import {memo} from 'react'
import {Text, View} from 'react-native'

import {NOMES_MESES} from '../../utils/cycleCalendar.utils'
import {CycleWeek} from './CycleWeek'
import {estilos} from './CycleCalendar.styles'

function CycleMonth({mes, aoPressionarDia}) {
    if (!mes || !Array.isArray(mes.semanas)) return null

    const nomeMes = NOMES_MESES[mes.mes - 1]
    const rotulo = `${nomeMes} de ${mes.ano}`

    return (
        <View
            testID={`mes-${mes.chave}`}
            style={estilos.mes}
        >
            <View
                accessible
                accessibilityRole="header"
                accessibilityLabel={rotulo}
                style={estilos.cabecalhoMes}
            >
                <Text style={estilos.nomeMes}>
                    {nomeMes}
                </Text>

                <Text style={estilos.anoMes}>
                    {mes.ano}
                </Text>
            </View>

            {mes.semanas.map((semana, indice) => (
                <CycleWeek
                    key={`${mes.chave}-semana-${indice}`}
                    semana={semana}
                    aoPressionarDia={aoPressionarDia}
                />
            ))}
        </View>
    )
}

const CycleMonthMemorizado = memo(CycleMonth)

export {CycleMonthMemorizado as CycleMonth}