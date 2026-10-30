import { useMemo, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { DropIcon } from 'phosphor-react-native/src/icons/Drop';
import { NOMES_MESES, normalizarMeses } from '../../calendar/utils/cycleCalendar.utils';
import { estilos } from '../screens/MenstruationRegistrationScreen.styles';

function deslocarDia(data, deslocamento) {
    const valor = new Date(`${data}T00:00:00Z`);
    valor.setUTCDate(valor.getUTCDate() + deslocamento);
    return valor.toISOString().slice(0, 10);
}

function MenstruationRegistrationCalendar({
    meses,
    datasSelecionadas,
    hoje,
    bloqueado,
    onAlternarData,
    onIniciarFaixa,
    onConflito,
    onCarregarAnteriores
}) {
    const ultimoToque = useRef(null);
    function tocarData(data, agora) {
        const duplo =
            ultimoToque.current?.data === data && agora - ultimoToque.current.instante <= 300;
        ultimoToque.current = duplo ? null : { data, instante: agora };
        if (duplo) onIniciarFaixa?.(data);
        else onAlternarData?.(data);
    }
    const dados = useMemo(
        () =>
            normalizarMeses(
                meses.map((mes) => ({ ...mes, previsao: null })),
                hoje
            ),
        [meses, hoje]
    );
    const selecionadas = useMemo(() => new Set(datasSelecionadas), [datasSelecionadas]);
    const indiceInicial = Math.max(
        0,
        dados.findIndex((mes) => mes.chave === hoje.slice(0, 7))
    );
    const layouts = useMemo(() => {
        return dados.reduce((anteriores, mes, index) => {
            const length = 42 + mes.semanas.length * 52 + StyleSheet.hairlineWidth;
            const anterior = anteriores[index - 1];
            const offset = anterior ? anterior.offset + anterior.length : 0;
            return [...anteriores, { index, length, offset }];
        }, []);
    }, [dados]);
    return (
        <FlatList
            key={dados.length ? 'meses-carregados' : 'meses-vazios'}
            testID="calendario-cadastro-menstruacao"
            data={dados}
            initialScrollIndex={dados.length ? indiceInicial : undefined}
            getItemLayout={(_, index) => layouts[index]}
            keyExtractor={(mes) => mes.chave}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            onStartReached={onCarregarAnteriores}
            renderItem={({ item: mes }) => (
                <View style={estilos.mes}>
                    <View style={estilos.tituloMes}>
                        <Text style={estilos.nomeMes}>{NOMES_MESES[mes.mes - 1]}</Text>
                        <Text style={estilos.ano}>{mes.ano}</Text>
                    </View>
                    {mes.semanas.map((semana, indice) => (
                        <View key={indice} style={estilos.semana}>
                            {semana.map((dia, coluna) => {
                                if (!dia) return <View key={coluna} style={estilos.celula} />;
                                const selecionado = selecionadas.has(dia.data);
                                const uneAntes =
                                    selecionado && selecionadas.has(deslocarDia(dia.data, -1));
                                const uneDepois =
                                    selecionado && selecionadas.has(deslocarDia(dia.data, 1));
                                const ponta = selecionado && (!uneAntes || !uneDepois);
                                const registrado = Boolean(dia.registroCicloId || dia.local);
                                const desativado = bloqueado || dia.futuro;
                                const rotulo = `${dia.dia} de ${NOMES_MESES[mes.mes - 1].toLowerCase()} de ${mes.ano}${registrado ? ', menstruação registrada' : selecionado ? ', selecionado' : dia.futuro ? ', data futura' : ''}`;
                                return (
                                    <View key={dia.data} style={estilos.celula}>
                                        {selecionado && (
                                            <View
                                                pointerEvents="none"
                                                testID={`selecao-${dia.data}`}
                                                style={[
                                                    estilos.faixa,
                                                    !uneAntes && estilos.inicioFaixa,
                                                    !uneDepois && estilos.fimFaixa
                                                ]}
                                            />
                                        )}
                                        <Pressable
                                            hitSlop={6}
                                            accessibilityRole="button"
                                            accessibilityLabel={rotulo}
                                            accessibilityActions={
                                                !registrado && !desativado
                                                    ? [
                                                          {
                                                              name: 'iniciarFaixa',
                                                              label: 'Iniciar uma nova faixa neste dia'
                                                          }
                                                      ]
                                                    : []
                                            }
                                            onAccessibilityAction={(evento) => {
                                                if (
                                                    !registrado &&
                                                    !desativado &&
                                                    evento.nativeEvent.actionName === 'iniciarFaixa'
                                                )
                                                    onIniciarFaixa?.(dia.data);
                                            }}
                                            accessibilityState={{
                                                selected: selecionado,
                                                disabled: desativado
                                            }}
                                            disabled={desativado}
                                            onPress={() =>
                                                registrado
                                                    ? onConflito?.(dia)
                                                    : tocarData(dia.data, Date.now())
                                            }
                                            style={[
                                                estilos.dia,
                                                registrado && estilos.registrado,
                                                ponta && estilos.ponta
                                            ]}
                                        >
                                            {(registrado || ponta) && (
                                                <DropIcon
                                                    size={9}
                                                    weight="fill"
                                                    color={ponta ? '#FFFFFF' : '#C85A44'}
                                                />
                                            )}
                                            <Text
                                                style={[
                                                    estilos.numero,
                                                    dia.futuro && estilos.futuro,
                                                    (registrado || selecionado) &&
                                                        estilos.numeroMarcado,
                                                    ponta && estilos.numeroPonta
                                                ]}
                                            >
                                                {dia.dia}
                                            </Text>
                                        </Pressable>
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>
            )}
        />
    );
}
export { MenstruationRegistrationCalendar };
