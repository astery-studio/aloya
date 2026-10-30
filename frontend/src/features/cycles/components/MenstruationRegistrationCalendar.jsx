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
