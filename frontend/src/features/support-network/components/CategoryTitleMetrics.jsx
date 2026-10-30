import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

// Mede os nomes com a fonte real, sem participar do layout visível ou da acessibilidade.
function CategoryTitleMetrics({ categorias, escala, onMedir }) {
    return (
        <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={estilos.oculto}
        >
            <ScrollView horizontal scrollEnabled={false}>
                {categorias.map((categoria) => (
                    <Text
                        key={`${escala}:${categoria.id}:${categoria.nome}`}
                        testID={`category-title-measure-${categoria.id}`}
                        onLayout={({ nativeEvent }) =>
                            onMedir(categoria.nome, nativeEvent.layout.width)
                        }
                        style={estilos.texto}
                    >
                        {categoria.nome.trim()}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
}
const estilos = StyleSheet.create({
    oculto: { position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' },
    texto: {
        flexShrink: 0,
        fontFamily: fontFamilies.bold,
        fontWeight: '700',
        fontSize: 14,
        includeFontPadding: false
    }
});
export { CategoryTitleMetrics };
