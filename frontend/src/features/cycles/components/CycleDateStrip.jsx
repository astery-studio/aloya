import { useEffect, useRef } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { estilos } from './CycleDateStrip.styles';

const LIMITE_CARREGAMENTO = 32;
const LARGURA_ITEM = 46 + 8;

function CycleDateStrip({ dias = [], dataSelecionada, aoSelecionarData, aoCarregarAnteriores, aoCarregarPosteriores }) {
    const carregamentos = useRef({ anteriores: false, posteriores: false });

    useEffect(() => {
        carregamentos.current = { anteriores: false, posteriores: false };
    }, [dias]);

    function carregarBordas({ nativeEvent }) {
        const { x } = nativeEvent.contentOffset;
        const larguraTotal = nativeEvent.contentSize.width;
        const larguraVisivel = nativeEvent.layoutMeasurement.width;
        if (larguraTotal <= larguraVisivel) return;
        if (x <= LIMITE_CARREGAMENTO && !carregamentos.current.anteriores) {
            carregamentos.current.anteriores = true;
            aoCarregarAnteriores?.();
        }
        if (larguraTotal - x - larguraVisivel <= LIMITE_CARREGAMENTO && !carregamentos.current.posteriores) {
            carregamentos.current.posteriores = true;
            aoCarregarPosteriores?.();
        }
    }

    return (
        <FlatList
            horizontal
            data={dias}
            keyExtractor={(item) => item.data}
            getItemLayout={(_, index) => ({ length: LARGURA_ITEM, offset: LARGURA_ITEM * index, index })}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
            onScrollEndDrag={carregarBordas}
            onMomentumScrollEnd={carregarBordas}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            style={estilos.container}
            contentContainerStyle={estilos.faixa}
            accessibilityLabel="Datas do ciclo"
            renderItem={({ item }) => {
                const selecionado = item.data === dataSelecionada;
                return (
                    <Pressable
                        key={item.data}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.semana}, dia ${item.dia ?? '?'}`}
                        accessibilityState={{ selected: selecionado }}
                        onPress={() => aoSelecionarData?.(item.data)}
                        style={[
                            estilos.dia,
                            selecionado && estilos.diaSelecionado,
                            selecionado && estilos[`diaSelecionado_${item.fase}`]
                        ]}
                    >
                        <Text style={[estilos.semana, selecionado && estilos.semanaSelecionada, selecionado && item.fase === 'desconhecida' && estilos.textoSelecionadoDesconhecido]}>
                            {item.semana}
                        </Text>
                        <Text style={[estilos.textoNumero, selecionado && estilos.numeroSelecionado, selecionado && item.fase === 'desconhecida' && estilos.textoSelecionadoDesconhecido]}>
                            {item.dia ?? '?'}
                        </Text>
                        <View testID={`indicador-${item.data}`} style={[estilos.indicador, item.hoje && estilos.indicadorHoje, selecionado && estilos.indicadorSelecionado, selecionado && item.fase === 'desconhecida' && estilos.indicadorSelecionadoDesconhecido]} />
                    </Pressable>
                );
            }}
        />
    );
}

export { CycleDateStrip };
