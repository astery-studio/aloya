import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { useTheme } from '../../../shared/hooks/useTheme';
import { estadoRegistroUso, partesDaDataUso } from '../utils/usageHistory';
import { criarEstilosUso } from './usageComponents.styles';

const DIAS_POR_SEMANA = 7;
const MINIMO_SEMANAS = 5;
const SEMANAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const ESTADOS = Object.freeze({
    confirmado: 'Confirmado',
    foraDoPrazo: 'Fora do prazo',
    naoConfirmado: 'Não confirmado',
    naoUsei: 'Não usei'
});
const ORDEM_LEGENDA = ['confirmado', 'foraDoPrazo', 'naoUsei', 'naoConfirmado'];
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

    return Array.from({ length: quantidadeSemanas }, (_, indice) =>
        celulas.slice(indice * DIAS_POR_SEMANA, (indice + 1) * DIAS_POR_SEMANA)
    );
}

function ehHoje(ano, numeroMes, dia) {
    if (!dia) return false;

    const hoje = new Date();
    return (
        hoje.getFullYear() === ano && hoje.getMonth() + 1 === numeroMes && hoje.getDate() === dia
    );
}

function UsageCalendar({
    mes, dias = [], aoMesAnterior, aoProximoMes,
    emEdicao = false, dataSelecionada, datasEditaveis, editarAntesDe, aoSelecionarData
}) {
    const tema = useTheme();
    const estilosUso = useMemo(() => criarEstilosUso(tema), [tema]);
    const { ano, numeroMes } = obterPartesDoMes(mes);
    const semanas = criarSemanas(ano, numeroMes);
    const possuiSeisSemanas = semanas.length === 6;
    const registros = new Map();
    const prioridades = { confirmado: 1, foraDoPrazo: 2, naoConfirmado: 3, naoUsei: 4 };
    dias.forEach((item) => {
        const partes = partesDaDataUso(item.data);
        if (partes && partes.chaveMes !== mes) return;
        const dia = Number(item.dia ?? partes?.dia);
        const estado = estadoRegistroUso(item);
        const totalDias = new Date(Date.UTC(ano, numeroMes, 0)).getUTCDate();
        if (!estado || !Number.isInteger(dia) || dia < 1 || dia > totalDias) return;
        if ((prioridades[registros.get(dia)] ?? 0) < prioridades[estado])
            registros.set(dia, estado);
    });
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
                    <CaretLeftIcon size={14} color={tema.cores.interface.textoSecundario} />
                </Pressable>
                <Text numberOfLines={1} style={estilosUso.tituloMes}>
                    {titulo}
                </Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Próximo mês"
                    onPress={aoProximoMes}
                    style={estilosUso.botaoMes}
                >
                    <CaretRightIcon size={14} color={tema.cores.interface.textoSecundario} />
                </Pressable>
            </View>

            <View style={estilosUso.margemDiasSemana}>
                <View style={estilosUso.diasSemana}>
                    {SEMANAS.map((semana, indice) => (
                        <Text key={`${semana}-${indice}`} style={estilosUso.diaSemana}>
                            {semana}
                        </Text>
                    ))}
                </View>
            </View>

            <View
                style={[
                    estilosUso.margemGradeDias,
                    possuiSeisSemanas && estilosUso.margemGradeDiasSeisSemanas
                ]}
            >
                <View
                    style={[
                        estilosUso.gradeDias,
                        possuiSeisSemanas && estilosUso.gradeDiasSeisSemanas
                    ]}
                >
                    {semanas.map((semana, indiceSemana) => (
                        <View key={`semana-${indiceSemana}`} style={estilosUso.linhaSemana}>
                            {semana.map((dia, indiceDia) => {
                                const estado = dia ? registros.get(dia) : null;
                                const rotuloEstado = ESTADOS[estado];
                                const hoje = ehHoje(ano, numeroMes, dia);
                                const dataCivil = dia ? `${mes}-${String(dia).padStart(2, '0')}` : null;
                                const selecionado = emEdicao && dataCivil === dataSelecionada;
                                const editavel = emEdicao && dia
                                    && (datasEditaveis?.has(dataCivil) || dataCivil < editarAntesDe);
                                const interativa = emEdicao && Boolean(dia) && typeof aoSelecionarData === 'function';
                                const Celula = interativa ? Pressable : View;

                                return (
                                    <Celula
                                        key={`${dia || 'vazio'}-${indiceSemana}-${indiceDia}`}
                                        accessible={Boolean(dia)}
                                        accessibilityRole={interativa ? 'button' : dia ? 'text' : undefined}
                                        {...(interativa && {
                                            accessibilityState: { selected: selecionado },
                                            accessibilityHint: editavel ? 'Seleciona o dia' : 'Explica por que o dia não pode ser editado',
                                            onPress: () => aoSelecionarData?.(dataCivil)
                                        })}
                                        accessibilityLabel={
                                            dia
                                                ? `Dia ${dia}, ${rotuloEstado ?? 'sem registro'}`
                                                : undefined
                                        }
                                        style={[
                                            estilosUso.celulaDia,
                                            hoje && estilosUso.celulaHoje,
                                            rotuloEstado && estilosUso[`celula_${estado}`],
                                            selecionado && estilosUso.celulaSelecionada,
                                            selecionado && !rotuloEstado && estilosUso.celulaSelecionadaSemRegistro
                                        ]}
                                    >
                                        {dia ? (
                                            <Text
                                                style={[
                                                    estilosUso.numeroDia,
                                                    hoje && estilosUso.numeroDiaHoje,
                                                    rotuloEstado && estilosUso.diaComEstado
                                                ]}
                                            >
                                                {dia}
                                            </Text>
                                        ) : null}
                                    </Celula>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>

            {!emEdicao ? <View testID="usage-calendar-legend" style={estilosUso.legenda}>
                {ORDEM_LEGENDA.map((estado) => (
                    <View key={estado} style={estilosUso.itemLegenda}>
                        <View
                            style={[estilosUso.marcadorLegenda, estilosUso[`marcador_${estado}`]]}
                        />
                        <Text style={estilosUso.textoLegenda}>{ESTADOS[estado]}</Text>
                    </View>
                ))}
            </View> : null}
        </View>
    );
}

export { UsageCalendar };
