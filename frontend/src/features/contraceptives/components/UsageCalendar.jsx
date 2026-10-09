import { Pressable, Text, View } from 'react-native';
import { ArrowLeftIcon } from '../../../shared/components/icons/AppIcons';
import { estilosUso } from './usageComponents.styles';

const DIAS_POR_SEMANA = 7;
const MINIMO_SEMANAS = 5;
const SEMANAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const ESTADOS = Object.freeze({
    confirmado: 'Confirmado',
    foraDoPrazo: 'Fora do prazo',
    naoConfirmado: 'Não confirmado'
});
const MESES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
];

function obterPartesDoMes(mes) {
    const [ano, numeroMes] = mes.split('-').map(Number);
    return { ano, numeroMes };
}

function criarSemanas(ano, numeroMes) {
    const totalDias = new Date(Date.UTC(ano, numeroMes, 0)).getUTCDate();
    const deslocamento = new Date(Date.UTC(ano, numeroMes - 1, 1)).getUTCDay();
    const quantidadeSemanas = Math.max(
        MINIMO_SEMANAS,
        Math.ceil((deslocamento + totalDias) / DIAS_POR_SEMANA)
    );
    const totalCelulas = quantidadeSemanas * DIAS_POR_SEMANA;
    const celulas = Array.from({ length: totalCelulas }, (_, indice) => {
        const dia = indice - deslocamento + 1;
        return dia >= 1 && dia <= totalDias ? dia : null;
    });

    return Array.from({ length: quantidadeSemanas }, (_, indice) => (
        celulas.slice(indice * DIAS_POR_SEMANA, (indice + 1) * DIAS_POR_SEMANA)
    ));
}

function ehHoje(ano, numeroMes, dia) {
    if (!dia) return false;

    const hoje = new Date();
    return hoje.getFullYear() === ano
        && hoje.getMonth() + 1 === numeroMes
        && hoje.getDate() === dia;
}

function UsageCalendar({ mes, dias = [], aoMesAnterior, aoProximoMes }) {
    const { ano, numeroMes } = obterPartesDoMes(mes);
    const semanas = criarSemanas(ano, numeroMes);
    const possuiSeisSemanas = semanas.length === 6;
    const registros = new Map(dias.map((item) => [Number(item.dia ?? item.data?.slice(-2)), item]));
    const titulo = `${MESES[numeroMes - 1]} ${ano}`;

    return (
        <View
            testID="usage-calendar"
            style={[estilosUso.calendario, possuiSeisSemanas && estilosUso.calendarioSeisSemanas]}
        >
            <View style={estilosUso.cabecalhoCalendario}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Mês anterior"
                    onPress={aoMesAnterior}
                    style={estilosUso.botaoMes}
                >
                    <ArrowLeftIcon size={14} color="#5C5C59" />
                </Pressable>
                <Text numberOfLines={1} style={estilosUso.tituloMes}>{titulo}</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Próximo mês"
                    onPress={aoProximoMes}
                    style={estilosUso.botaoMes}
                >
                    <ArrowLeftIcon size={14} color="#5C5C59" style={estilosUso.setaProximo} />
                </Pressable>
            </View>

            <View style={estilosUso.margemDiasSemana}>
                <View style={estilosUso.diasSemana}>
                    {SEMANAS.map((semana, indice) => (
                        <Text key={`${semana}-${indice}`} style={estilosUso.diaSemana}>{semana}</Text>
                    ))}
                </View>
            </View>

            <View style={[
                estilosUso.margemGradeDias,
                possuiSeisSemanas && estilosUso.margemGradeDiasSeisSemanas
            ]}>
                <View style={[
                    estilosUso.gradeDias,
                    possuiSeisSemanas && estilosUso.gradeDiasSeisSemanas
                ]}>
                    {semanas.map((semana, indiceSemana) => (
                        <View key={`semana-${indiceSemana}`} style={estilosUso.linhaSemana}>
                            {semana.map((dia, indiceDia) => {
                                const estado = dia ? registros.get(dia)?.estado : null;
                                const rotuloEstado = ESTADOS[estado];
                                const hoje = ehHoje(ano, numeroMes, dia);

                                return (
                                    <View
                                        key={`${dia || 'vazio'}-${indiceSemana}-${indiceDia}`}
                                        accessible={Boolean(dia)}
                                        accessibilityRole={dia ? 'text' : undefined}
                                        accessibilityLabel={dia
                                            ? `Dia ${dia}, ${rotuloEstado ?? 'sem registro'}`
                                            : undefined}
                                        style={[
                                            estilosUso.celulaDia,
                                            hoje && estilosUso.celulaHoje,
                                            rotuloEstado && estilosUso[`celula_${estado}`]
                                        ]}
                                    >
                                        {dia ? (
                                            <Text style={[
                                                estilosUso.numeroDia,
                                                hoje && estilosUso.numeroDiaHoje,
                                                rotuloEstado && estilosUso.diaComEstado
                                            ]}>
                                                {dia}
                                            </Text>
                                        ) : null}
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>

            <View style={estilosUso.legenda}>
                {Object.entries(ESTADOS).map(([estado, rotulo]) => (
                    <View
                        key={estado}
                        style={[estilosUso.itemLegenda, estilosUso[`itemLegenda_${estado}`]]}
                    >
                        <View style={[estilosUso.marcadorLegenda, estilosUso[`marcador_${estado}`]]} />
                        <Text style={[estilosUso.textoLegenda, estilosUso[`textoLegenda_${estado}`]]}>
                            {rotulo}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export { UsageCalendar };
