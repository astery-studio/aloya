import { Pressable, Text, View } from 'react-native';
import { RewindIcon } from 'phosphor-react-native/src/icons/Rewind';

function ReturnToTodayButton({ onPress }) {
    const estilos = {
        faixa: {
            width: '100%',
            height: 38,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 2,
            paddingHorizontal: 16
        },
        botao: {
            width: 135,
            height: 34,
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 13,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: '#AAAAA5',
            borderStyle: 'dashed',
            borderRadius: 999
        },
        texto: {
            color: '#5C5C59',
            fontFamily: 'DMSans_400Regular',
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 20
        }
    };

    return (
        <View testID="faixa-voltar-hoje" style={estilos.faixa}>
            <Pressable accessibilityRole="button" onPress={onPress} style={estilos.botao}>
                <RewindIcon size={13} color="#5C5C59" weight="regular" />
                <Text style={estilos.texto}>Voltar pra hoje</Text>
            </Pressable>
        </View>
    );
}

export { ReturnToTodayButton };
