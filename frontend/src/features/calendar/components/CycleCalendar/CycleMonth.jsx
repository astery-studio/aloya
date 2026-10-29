//Mostra um mês completo usando semanas previamente normalizadas.
import { memo } from 'react';
import { Text, View } from 'react-native';
import { NOMES_MESES } from '../../utils/cycleCalendar.utils';
import { CycleWeek } from './CycleWeek';
import { estilosTemaClaro } from './CycleCalendar.styles';

function CycleMonth({ mes, aoPressionarDia, estilosTema = estilosTemaClaro }) {
    if (!mes || !Array.isArray(mes.semanas)) return null;

    const { estilos } = estilosTema;
    const nomeMes = NOMES_MESES[mes.mes - 1];
    const rotulo = `${nomeMes} de ${mes.ano}`;

    return (
        <View testID={`mes-${mes.chave}`} style={estilos.mes}>
            <View
                accessible
                accessibilityRole="header"
                accessibilityLabel={rotulo}
                style={estilos.cabecalhoMes}
            >
                <Text style={estilos.nomeMes}>{nomeMes}</Text>
                <Text style={estilos.anoMes}>{mes.ano}</Text>
            </View>
            {mes.semanas.map((semana, indice) => (
                <CycleWeek
                    key={`${mes.chave}-semana-${indice}`}
                    semana={semana}
                    aoPressionarDia={aoPressionarDia}
                    estilosTema={estilosTema}
                />
            ))}
            <View testID={`divisor-mes-${mes.chave}`} style={estilos.divisorMes} />
        </View>
    );
}

const CycleMonthMemorizado = memo(CycleMonth);

export { CycleMonthMemorizado as CycleMonth };
