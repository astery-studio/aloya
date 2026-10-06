import { Pressable, ScrollView, Text, View } from 'react-native';
import { estilos } from './CycleDateStrip.styles';

function CycleDateStrip({ dias = [], dataSelecionada, aoSelecionarData }) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.faixa}
            accessibilityLabel="Datas do ciclo"
        >
            {dias.map((item) => {
                const selecionado = item.data === dataSelecionada;
                return (
                    <Pressable
                        key={item.data}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.semana}, dia ${item.dia}`}
                        accessibilityState={{ selected: selecionado }}
                        onPress={() => aoSelecionarData?.(item.data)}
                        style={[estilos.dia, selecionado && estilos.diaSelecionado]}
                    >
                        <Text style={[estilos.semana, selecionado && estilos.textoSelecionado]}>
                            {item.semana}
                        </Text>
                        <Text style={[estilos.textoNumero, selecionado && estilos.textoSelecionado]}>
                            {item.dia ?? '?'}
                        </Text>
                        <View style={[estilos.indicador, item.hoje && estilos.indicadorHoje, selecionado && estilos.indicadorSelecionado]} />
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

export { CycleDateStrip };
