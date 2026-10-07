import { Pressable, ScrollView, Text, View } from 'react-native';
import { estilos } from './CycleDateStrip.styles';

function CycleDateStrip({ dias = [], dataSelecionada, aoSelecionarData }) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={estilos.container}
            contentContainerStyle={estilos.faixa}
            accessibilityLabel="Datas do ciclo"
        >
            {dias.map((item) => {
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
                        <View style={[estilos.indicador, item.hoje && estilos.indicadorHoje, selecionado && estilos.indicadorSelecionado, selecionado && item.fase === 'desconhecida' && estilos.indicadorSelecionadoDesconhecido]} />
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

export { CycleDateStrip };
