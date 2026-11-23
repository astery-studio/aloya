import { Text, View } from 'react-native';
import { InfoIcon, WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { estilos } from './CycleEducationalDisclaimer.styles';

function CycleEducationalDisclaimer({ texto, variante = 'educativa', icone, style }) {
    const contraceptiva = variante === 'contraceptiva';
    const Icone = contraceptiva ? WarningCircleIcon : InfoIcon;

    return (
        <View
            accessibilityLabel={texto}
            style={[estilos.base, contraceptiva ? estilos.contraceptiva : estilos.educativa, style]}
        >
            {icone ?? <Icone size={contraceptiva ? 16 : 17} color="#5C5C59" weight="fill" />}
            <Text
                style={[
                    estilos.texto,
                    contraceptiva ? estilos.textoContraceptivo : estilos.textoEducativo
                ]}
            >
                {texto}
            </Text>
        </View>
    );
}

export { CycleEducationalDisclaimer };
