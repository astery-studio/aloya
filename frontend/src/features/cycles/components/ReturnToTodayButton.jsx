import { Pressable, Text, View } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

function ReturnToTodayButton({ onPress }) {
    const estilos = {
        faixa: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 6
        },
        botao: {
            minHeight: 34,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 13,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: '#D68C3A',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 5
        },
        textoBase: {
            color: '#FFFFFF',
            fontSize: 10,
            includeFontPadding: false,
            lineHeight: 20
        },
        textoVoltar: {
            fontFamily: fontFamilies.light,
            fontWeight: '300'
        },
        textoHoje: {
            fontFamily: fontFamilies.medium,
            fontWeight: '500'
        }
    };

    return (
        <View testID="faixa-voltar-hoje" style={estilos.faixa}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar para hoje"
                onPress={onPress}
                style={estilos.botao}
            >
                <Text style={[estilos.textoBase, estilos.textoVoltar]}>Voltar para:</Text>
                <Text style={[estilos.textoBase, estilos.textoHoje]}>Hoje</Text>
            </Pressable>
        </View>
    );
}

export { ReturnToTodayButton };
