import { Pressable, Text } from 'react-native';
import { RewindIcon } from 'phosphor-react-native/src/icons/Rewind';

function ReturnToTodayButton({ onPress }) {
    const estilos = {
        botao: {
            width: 135,
            height: 34,
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginLeft: 18,
            marginBottom: 8,
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
        <Pressable accessibilityRole="button" onPress={onPress} style={estilos.botao}>
            <RewindIcon size={13} color="#5C5C59" weight="regular" />
            <Text style={estilos.texto}>Voltar pra hoje</Text>
        </Pressable>
    );
}

export { ReturnToTodayButton };
