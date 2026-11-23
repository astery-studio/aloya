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
                gap: 8,
                minHeight: 40,
                marginVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: tema.cores.interface.borda
            },
            texto: {
                color: tema.cores.interface.textoPrincipal,
                fontFamily: 'DMSans_600SemiBold',
                fontSize: 14,
                lineHeight: 20
            }
        }),
        [tema]
    );

    return (
        <Pressable accessibilityRole="button" onPress={onPress} style={estilos.botao}>
            <ArrowsClockwiseIcon size={18} color={tema.cores.interface.textoPrincipal} />
            <Text style={estilos.texto}>Voltar para hoje</Text>
        </Pressable>
    );
}

export { ReturnToTodayButton };
