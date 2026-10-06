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
                        <View style={[estilos.numero, estilos[item.fase], selecionado && estilos.numeroSelecionado]}>
                            <Text style={[estilos.textoNumero, selecionado && estilos.textoSelecionado]}>
                                {item.dia ?? '?'}
                            </Text>
                        </View>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

export { CycleDateStrip };
