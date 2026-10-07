import { Pressable, Text, View } from 'react-native';
import { ArrowLeftIcon } from '../../../shared/components/icons/AppIcons';
import { estilosUso } from './usageComponents.styles';

const SEMANAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const ROTULOS_ESTADO = {
    confirmado: 'Confirmado',
    foraDoPrazo: 'Fora do prazo',
    naoConfirmado: 'Não confirmado'
};
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function obterPartesDoMes(mes) {
    const [ano, numeroMes] = mes.split('-').map(Number);
    return { ano, numeroMes };
}

function UsageCalendar({ mes, dias = [], aoMesAnterior, aoProximoMes }) {
    const { ano, numeroMes } = obterPartesDoMes(mes);
    const totalDias = new Date(Date.UTC(ano, numeroMes, 0)).getUTCDate();
    const deslocamento = new Date(Date.UTC(ano, numeroMes - 1, 1)).getUTCDay();
    const registros = new Map(dias.map((item) => [Number(item.dia ?? item.data?.slice(-2)), item]));
    const titulo = `${MESES[numeroMes - 1]} ${ano}`;
    const celulas = [...Array(deslocamento).fill(null), ...Array.from({ length: totalDias }, (_, indice) => indice + 1)];

    return (
        <View style={estilosUso.calendario}>
            <View style={estilosUso.cabecalhoCalendario}>
                <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={aoMesAnterior} style={estilosUso.botaoMes}>
                    <ArrowLeftIcon size={14} color="#5C5C59" />
                </Pressable>
                <Text style={estilosUso.tituloMes}>{titulo}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={aoProximoMes} style={estilosUso.botaoMes}>
                    <ArrowLeftIcon size={14} color="#5C5C59" style={estilosUso.setaProximo} />
                </Pressable>
            </View>
            <View style={estilosUso.gradeCalendario}>
                {SEMANAS.map((semana, indice) => <Text key={`${semana}-${indice}`} style={estilosUso.diaSemana}>{semana}</Text>)}
                {celulas.map((dia, indice) => {
                    const estado = dia ? registros.get(dia)?.estado : null;
                    return <View key={`${dia || 'vazio'}-${indice}`} style={[estilosUso.celulaDia, estado && estilosUso[`celula_${estado}`]]}>
                        {dia ? <Text style={[estilosUso.numeroDia, estado && estilosUso.diaComEstado]}>{dia}</Text> : null}
                    </View>;
                })}
            </View>
            <View style={estilosUso.legenda}>
                {Object.entries(ROTULOS_ESTADO).map(([estado, rotulo]) => (
                    <View key={estado} style={estilosUso.itemLegenda}>
                        <View style={[estilosUso.marcadorLegenda, estilosUso[`marcador_${estado}`]]} />
                        <Text style={estilosUso.textoLegenda}>{rotulo}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export { UsageCalendar };
