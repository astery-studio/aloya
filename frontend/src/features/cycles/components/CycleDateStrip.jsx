import { useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos } from './CycleDateStrip.styles';

const LIMITE_CARREGAMENTO = 32;
const LARGURA_DIA = 46;
const ESPACAMENTO_ENTRE_DIAS = 8;
const LARGURA_ITEM = LARGURA_DIA + ESPACAMENTO_ENTRE_DIAS;
const PADDING_LATERAL_MINIMO = 8;

function calcularPaddingLateral(larguraVisivel) {
    if (!larguraVisivel) return PADDING_LATERAL_MINIMO;
    return Math.max(PADDING_LATERAL_MINIMO, (larguraVisivel - LARGURA_DIA) / 2);
}

function CycleDateStrip({
    dias = [],
    dataSelecionada,
    aoSelecionarData,
    aoCarregarAnteriores,
    aoCarregarPosteriores,
    semCiclo = false,
    margemHorizontal = 0
}) {
    const tema = useTheme();
    const { width } = useWindowDimensions();
    const larguraVisivel = Math.max(0, width - 2 * margemHorizontal);
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const carregamentos = useRef({ anteriores: false, posteriores: false });
    const lista = useRef(null);
    const dataTocada = useRef(null);
    const selecaoPosicionada = useRef(null);
    const animarRecuperacao = useRef(false);
    const paddingLateral = calcularPaddingLateral(larguraVisivel);
    const indiceInicial = dias.findIndex(({ data }) => data === dataSelecionada);
    const deslocamentoInicial = useRef({
        x: Math.max(0, indiceInicial * LARGURA_ITEM),
        y: 0
    });

    useEffect(() => {
        carregamentos.current = { anteriores: false, posteriores: false };
    }, [dias]);

    useEffect(() => {
        if (!larguraVisivel) return;

        const anterior = selecaoPosicionada.current;
        if (
            anterior &&
            anterior.data === dataSelecionada &&
            anterior.larguraVisivel === larguraVisivel
        )
            return;

        const indice = dias.findIndex(({ data }) => data === dataSelecionada);
        if (indice < 0) return;

        const primeiraPosicao = !anterior;
        selecaoPosicionada.current = { data: dataSelecionada, larguraVisivel };
        const tocouNoDia = dataTocada.current === dataSelecionada;
        dataTocada.current = null;
        if (!primeiraPosicao && !tocouNoDia) {
            animarRecuperacao.current = true;
            lista.current?.scrollToIndex({
                index: indice,
                animated: true,
                viewPosition: 0.5
            });
        }
    }, [dataSelecionada, dias, larguraVisivel]);

    function carregarBordas({ nativeEvent }) {
        const { x } = nativeEvent.contentOffset;
        const larguraTotal = nativeEvent.contentSize.width;
        const larguraVisivel = nativeEvent.layoutMeasurement.width;
        if (larguraTotal <= larguraVisivel) return;
        if (x <= LIMITE_CARREGAMENTO && !carregamentos.current.anteriores) {
            carregamentos.current.anteriores = true;
            aoCarregarAnteriores?.();
        }
        if (
            larguraTotal - x - larguraVisivel <= LIMITE_CARREGAMENTO &&
            !carregamentos.current.posteriores
        ) {
            carregamentos.current.posteriores = true;
            aoCarregarPosteriores?.();
        }
    }

    function recuperarRolagem({ index, averageItemLength }) {
        const comprimentoItem = averageItemLength || LARGURA_ITEM;
        const centroDisponivel = (larguraVisivel - LARGURA_DIA) / 2;
        lista.current?.scrollToOffset({
            offset: Math.max(0, paddingLateral + index * comprimentoItem - centroDisponivel),
            animated: animarRecuperacao.current
        });
    }

    return (
        <FlatList
            ref={lista}
            horizontal
            data={dias}
            contentOffset={deslocamentoInicial.current}
            keyExtractor={(item) => item.data}
            getItemLayout={(_, index) => ({
                length: LARGURA_ITEM,
                offset: paddingLateral + LARGURA_ITEM * index,
                index
            })}
            initialNumToRender={16}
            maxToRenderPerBatch={10}
            windowSize={5}
            maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
            onScrollToIndexFailed={recuperarRolagem}
            onScrollEndDrag={carregarBordas}
            onMomentumScrollEnd={carregarBordas}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            style={[
                estilos.container,
                semCiclo && estilos.containerSemCiclo,
                margemHorizontal > 0 && {
                    width: larguraVisivel,
                    alignSelf: 'center',
                    paddingHorizontal: 0
                }
            ]}
            contentContainerStyle={[estilos.faixa, { paddingHorizontal: paddingLateral }]}
            accessibilityLabel="Datas do ciclo"
            renderItem={({ item }) => {
                const selecionado = item.data === dataSelecionada;
                const interiorSemFundo = semCiclo || selecionado;
                return (
                    <Pressable
                        key={item.data}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.semana}, dia ${item.dia ?? '?'}`}
                        accessibilityState={{ selected: selecionado }}
                        onPress={() => {
                            if (!aoSelecionarData || selecionado) return;
                            dataTocada.current = item.data;
                            aoSelecionarData(item.data);
                        }}
                        style={[
                            estilos.dia,
                            semCiclo ? estilos.dia_desconhecida : estilos[`dia_${item.fase}`],
                            semCiclo && estilos.diaSemCiclo,
                            selecionado && estilos.diaSelecionado,
                            selecionado &&
                                (semCiclo || item.fase === 'desconhecida') &&
                                estilos.diaSelecionadoDesconhecida
                        ]}
                    >
                        <View
                            style={[
                                estilos.interior,
                                interiorSemFundo && estilos.interiorSelecionado
                            ]}
                        >
                            <View
                                testID={`fundo-dia-${item.data}`}
                                pointerEvents="none"
                                style={[
                                    estilos.fundoInterior,
                                    interiorSemFundo && estilos.fundoInteriorOculto
                                ]}
                            />
                            <Text
                                style={[estilos.semana, selecionado && estilos.semanaSelecionada]}
                            >
                                {item.semana}
                            </Text>
                            <Text
                                style={[
                                    estilos.textoNumero,
                                    selecionado && estilos.numeroSelecionado
                                ]}
                            >
                                {item.dia ?? '?'}
                            </Text>
                            <View
                                testID={`indicador-${item.data}`}
                                style={[
                                    estilos.indicador,
                                    item.hoje && estilos.indicadorHoje,
                                    selecionado && estilos.indicadorSelecionado,
                                    item.hoje && selecionado && estilos.indicadorHojeSelecionado
                                ]}
                            />
                        </View>
                    </Pressable>
                );
            }}
        />
    );
}

export { calcularPaddingLateral, CycleDateStrip };
