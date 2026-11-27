import { useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos } from './CycleDateStrip.styles';

const LIMITE_CARREGAMENTO = 32;
const LARGURA_ITEM = 46 + 8;

function CycleDateStrip({
    dias = [],
    dataSelecionada,
    aoSelecionarData,
    aoCarregarAnteriores,
    aoCarregarPosteriores,
    semCiclo = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const carregamentos = useRef({ anteriores: false, posteriores: false });
    const lista = useRef(null);
    const dataTocada = useRef(null);
    const selecaoPosicionada = useRef(null);

    useEffect(() => {
        carregamentos.current = { anteriores: false, posteriores: false };
    }, [dias]);

    useEffect(() => {
        const anterior = selecaoPosicionada.current;
        if (anterior && anterior.data === dataSelecionada && anterior.semCiclo === semCiclo) return;

        const indice = dias.findIndex(({ data }) => data === dataSelecionada);
        if (indice < 0) return;

        selecaoPosicionada.current = { data: dataSelecionada, semCiclo };
        const tocouNoDia = dataTocada.current === dataSelecionada;
        dataTocada.current = null;
        if (!tocouNoDia) {
            lista.current?.scrollToIndex({
                index: indice,
                animated: true,
                viewPosition: semCiclo ? 0 : 0.5
            });
        }
    }, [dataSelecionada, dias, semCiclo]);

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
        lista.current?.scrollToOffset({
            offset: Math.max(0, index * (averageItemLength || LARGURA_ITEM)),
            animated: true
        });
    }

    return (
        <FlatList
            ref={lista}
            horizontal
            data={dias}
            keyExtractor={(item) => item.data}
            getItemLayout={(_, index) => ({
                length: LARGURA_ITEM,
                offset: LARGURA_ITEM * index,
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
            style={[estilos.container, semCiclo && estilos.containerSemCiclo]}
            contentContainerStyle={estilos.faixa}
            accessibilityLabel="Datas do ciclo"
            renderItem={({ item }) => {
                const selecionado = item.data === dataSelecionada;
                const interiorSemFundo = semCiclo || selecionado;
                const selecionadoComFase = selecionado && !semCiclo && item.fase !== 'desconhecida';
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
                                style={[
                                    estilos.semana,
                                    selecionado && estilos.semanaSelecionada,
                                    selecionadoComFase && estilos.textoSelecionadoComFase
                                ]}
                            >
                                {item.semana}
                            </Text>
                            <Text
                                style={[
                                    estilos.textoNumero,
                                    selecionado && estilos.numeroSelecionado,
                                    selecionadoComFase && estilos.textoSelecionadoComFase
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
                                    item.hoje && selecionado && estilos.indicadorHojeSelecionado,
                                    item.hoje &&
                                        selecionadoComFase &&
                                        estilos.indicadorHojeSelecionadoComFase
                                ]}
                            />
                        </View>
                    </Pressable>
                );
            }}
        />
    );
}

export { CycleDateStrip };
