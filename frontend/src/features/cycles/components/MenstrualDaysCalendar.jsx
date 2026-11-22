import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { NOMES_MESES } from '../../calendar/utils/cycleCalendar.utils';
import { criarEstilos } from './MenstrualDaysCalendar.styles';

const DIAS_DA_SEMANA = Object.freeze(['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']);

function formatarChaveMes(chave) {
    const [ano, mes] = chave.split('-').map(Number);
    return { ano, mes };
}

function criarDiasDoMes(mes) {
    const { ano, mes: numeroMes } = formatarChaveMes(mes.mes);
    const quantidadeDias = new Date(Date.UTC(ano, numeroMes, 0)).getUTCDate();
    const primeiroDiaSemana = new Date(Date.UTC(ano, numeroMes - 1, 1)).getUTCDay();
    const diasMarcados = new Set((mes.diasMenstruacao || []).map((dia) => dia.data));

    return [
        ...Array(primeiroDiaSemana).fill(null),
        ...Array.from({ length: quantidadeDias }, (_, indice) => {
            const dia = indice + 1;
            const data = `${mes.mes}-${String(dia).padStart(2, '0')}`;
            return { dia, data, marcado: diasMarcados.has(data) };
        })
    ];
}

function MenstrualDaysCalendar({
    meses = [],
    aoPressionarDia,
    desativado = false,
    carregando = false,
    larguraMes = 312,
    editavel = false,
    mesInicial
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema, editavel), [tema, editavel]);

    if (carregando) {
        return (
            <View style={estilos.carregando}>
                <ActivityIndicator
                    accessibilityLabel="Carregando calendário"
                    color={tema.escuro ? '#EE9297' : '#C85A44'}
                />
            </View>
        );
    }

    return (
        <ScrollView
            key={editavel ? `${mesInicial}:${larguraMes}` : 'remocao'}
            horizontal
            contentOffset={
                editavel
                    ? {
                          x:
                              Math.max(
                                  0,
                                  meses.findIndex((mes) => mes.mes === mesInicial)
                              ) * larguraMes,
                          y: 0
                      }
                    : undefined
            }
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            accessibilityHint="Deslize para alternar entre os meses do ciclo"
        >
            {meses.map((mes) => {
                const { ano, mes: numeroMes } = formatarChaveMes(mes.mes);
                const dias = criarDiasDoMes(mes);

                return (
                    <View
                        key={mes.mes}
                        testID={`mes-calendario-${mes.mes}`}
                        style={[estilos.mes, { width: larguraMes }]}
                    >
                        <View style={estilos.tituloMes}>
                            <Text style={estilos.nomeMes}>{NOMES_MESES[numeroMes - 1]}</Text>
                            <Text style={estilos.anoMes}>{ano}</Text>
                        </View>
                        <View style={estilos.grade}>
                            {DIAS_DA_SEMANA.map((dia) => (
                                <Text key={dia} style={estilos.diaDaSemana}>
                                    {dia}
                                </Text>
                            ))}
                            {dias.map((dia, indice) => (
                                <View key={dia?.data || `vazio-${indice}`} style={estilos.celula}>
                                    {dia && (dia.marcado || editavel) ? (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel={
                                                editavel
                                                    ? `${dia.marcado ? 'Desmarcar' : 'Marcar'} dia ${dia.data}`
                                                    : `Desmarcar dia ${dia.dia}`
                                            }
                                            accessibilityState={{
                                                disabled: desativado,
                                                ...(editavel ? { selected: dia.marcado } : {})
                                            }}
                                            disabled={desativado}
                                            onPress={() => aoPressionarDia?.({ data: dia.data })}
                                            style={
                                                editavel
                                                    ? [
                                                          estilos.diaEditavel,
                                                          dia.marcado &&
                                                              estilos.diaSelecionadoEdicao
                                                      ]
                                                    : estilos.diaMarcado
                                            }
                                        >
                                            <Text
                                                style={
                                                    editavel
                                                        ? [
                                                              estilos.numeroDia,
                                                              dia.marcado &&
                                                                  estilos.numeroSelecionadoEdicao
                                                          ]
                                                        : estilos.numeroMarcado
                                                }
                                            >
                                                {dia.dia}
                                            </Text>
                                        </Pressable>
                                    ) : dia ? (
                                        <Text style={estilos.numeroDia}>{dia.dia}</Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}

export { MenstrualDaysCalendar, criarDiasDoMes };
