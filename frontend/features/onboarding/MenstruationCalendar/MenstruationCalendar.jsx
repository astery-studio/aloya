/**
 * Calendário inline que seleciona um período menstrual contínuo.
 *
 * Reutiliza a grade mensal de getMonthDays e os padrões visuais do
 * DatePickerSheet, mantendo lógica e container próprios desta tela.
 */
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { CaretDownIcon as CaretDown } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretLeftIcon as CaretLeft } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRightIcon as CaretRight } from 'phosphor-react-native/src/icons/CaretRight';
import { getMonthDays } from '../../../utils/getMonthDays';
import { cores } from '../../../theme';
import { estilos } from './MenstruationCalendar.styles';

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function obterMesInicial(valor) {
    const data = valor?.inicio ? new Date(`${valor.inicio}T12:00:00`) : new Date();
    return { ano: data.getFullYear(), mes: data.getMonth() + 1 };
}

export default function MenstruationCalendar({ valor, aoAlterar }) {
    const [visivel, setVisivel] = useState(() => obterMesInicial(valor));
    const [listaAberta, setListaAberta] = useState(false);
    const hoje = new Date().toISOString().slice(0, 10);
    const casas = useMemo(() => {
        const dias = getMonthDays(visivel.ano, visivel.mes);
        return [...dias, ...Array(42 - dias.length).fill(null)];
    }, [visivel]);

    function moverMes(direcao) {
        setListaAberta(false);
        setVisivel((atual) => {
            const data = new Date(atual.ano, atual.mes - 1 + direcao, 1);
            return { ano: data.getFullYear(), mes: data.getMonth() + 1 };
        });
    }

    function escolherMes(indice) {
        setVisivel((atual) => ({ ...atual, mes: indice + 1 }));
        setListaAberta(false);
    }

    function selecionar(data) {
        const inicio = valor?.inicio;
        const fim = valor?.fim;
        if (!inicio || fim) {
            aoAlterar({ inicio: data, fim: null });
            return;
        }
        aoAlterar(data < inicio
            ? { inicio: data, fim: inicio }
            : { inicio, fim: data });
    }

    function estaSelecionado(data) {
        if (!data || !valor?.inicio) return false;
        return data >= valor.inicio && data <= (valor.fim || valor.inicio);
    }

    return (
        <View style={estilos.calendario}>
            <View style={estilos.cabecalho}>
                <Pressable accessibilityLabel="Mês anterior" hitSlop={8}
                    style={estilos.navegacao} onPress={() => moverMes(-1)}>
                    <CaretLeft size={20} color={cores.neutras.textoPrincipalClaro} />
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Escolher mês"
                    accessibilityState={{ expanded: listaAberta }}
                    onPress={() => setListaAberta((aberta) => !aberta)}
                    style={estilos.tituloMes}>
                    <Text accessibilityRole="header"
                        accessibilityLabel={`${meses[visivel.mes - 1]} de ${visivel.ano}`}
                        style={estilos.textoMes}>
                        {meses[visivel.mes - 1]} {visivel.ano}
                    </Text>
                    <CaretDown size={16} color={cores.neutras.textoSecundarioClaro}
                        style={listaAberta && estilos.setaAberta} />
                </Pressable>
                <Pressable accessibilityLabel="Próximo mês" hitSlop={8}
                    style={estilos.navegacao} onPress={() => moverMes(1)}>
                    <CaretRight size={20} color={cores.neutras.textoPrincipalClaro} />
                </Pressable>
            </View>
            {listaAberta ? (
                <FlatList data={meses} style={estilos.listaMeses}
                    keyExtractor={(mes) => mes}
                    renderItem={({ item, index }) => (
                        <Pressable accessibilityRole="button"
                            accessibilityLabel={`Selecionar ${item} de ${visivel.ano}`}
                            accessibilityState={{ selected: index + 1 === visivel.mes }}
                            onPress={() => escolherMes(index)} style={estilos.opcaoMes}>
                            <Text style={[estilos.textoOpcao,
                                index + 1 === visivel.mes && estilos.textoOpcaoSelecionada]}>
                                {item}
                            </Text>
                        </Pressable>
                    )} />
            ) : <>
                <View style={estilos.semana}>
                    {semana.map((dia) => <Text key={dia} style={estilos.textoSemana}>{dia}</Text>)}
                </View>
                <View style={estilos.grade}>
                {casas.map((casa, indice) => {
                    const habilitado = Boolean(casa && casa.data <= hoje);
                    const selecionado = estaSelecionado(casa?.data);
                    return (
                        <View key={casa?.data || `vazio-${indice}`} style={estilos.casa}>
                            {casa ? <Pressable
                                accessibilityLabel={`Selecionar dia ${casa.dia}`}
                                accessibilityState={{ selected: selecionado, disabled: !habilitado }}
                                disabled={!habilitado} onPress={() => selecionar(casa.data)}
                                style={[estilos.dia, selecionado && estilos.diaSelecionado]}>
                                <Text style={[estilos.textoDia,
                                    selecionado && estilos.textoSelecionado,
                                    !habilitado && estilos.textoDesabilitado]}>
                                    {casa.dia}
                                </Text>
                            </Pressable> : null}
                        </View>
                    );
                })}
                </View>
            </>}
        </View>
    );
}
