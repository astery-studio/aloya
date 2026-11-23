import { Text, View } from 'react-native';
import { InfoIcon, WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';

function CycleEducationalDisclaimer({ texto, variante = 'educativa' }) {
    const tema = useTheme();
    const contraceptiva = variante === 'contraceptiva';
    const Icone = contraceptiva ? WarningCircleIcon : InfoIcon;
    const cor = contraceptiva ? tema.cores.feedback.aviso : tema.cores.feedback.informacao;

    return (
        <View
            accessibilityLabel={texto}
            style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: cor,
                backgroundColor: tema.cores.interface.superficie
            }}
        >
            <Icone size={18} color={cor} weight="fill" />
            <Text style={{ flex: 1, color: tema.cores.interface.textoSecundario, lineHeight: 20 }}>
                {texto}
            </Text>
        </View>
    );
}

export { CycleEducationalDisclaimer };
