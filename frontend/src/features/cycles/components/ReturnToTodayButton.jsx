import { useMemo } from 'react';
import { Pressable, Text } from 'react-native';
import { ArrowsClockwiseIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';

function ReturnToTodayButton({ onPress }) {
    const tema = useTheme();
    const estilos = useMemo(
        () => ({
            botao: {
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                height: 34,
                marginBottom: 8,
                paddingHorizontal: 13,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: '#AAAAA5',
                borderStyle: 'dashed'
            },
            texto: {
                color: tema.cores.interface.textoPrincipal,
                fontFamily: 'DMSans_400Regular',
                fontSize: 13,
                lineHeight: 20
            }
        }),
        [tema]
    );

    return (
        <Pressable accessibilityRole="button" onPress={onPress} style={estilos.botao}>
            <ArrowsClockwiseIcon size={13} color="#5C5C59" />
            <Text style={estilos.texto}>Voltar pra hoje</Text>
        </Pressable>
    );
}

export { ReturnToTodayButton };
