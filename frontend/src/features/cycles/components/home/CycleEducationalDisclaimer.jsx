import { useHomeColors } from '../../hooks/useHomeColors';
import { Text, View } from 'react-native';
import { InfoIcon, WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { estilos as estilosClaros } from './CycleEducationalDisclaimer.styles';

function CycleEducationalDisclaimer({ texto, variante = 'educativa', icone, style, textStyle }) {
    const { estilos, cor: adaptarCor } = useHomeColors(estilosClaros);
    const contraceptiva = variante === 'contraceptiva';
    const Icone = contraceptiva ? WarningCircleIcon : InfoIcon;

    return (
        <View
            accessibilityLabel={texto}
            style={[estilos.base, contraceptiva ? estilos.contraceptiva : estilos.educativa, style]}
        >
            {icone ?? (
                <Icone
                    size={contraceptiva ? 16 : 17}
                    color={adaptarCor('#5C5C59')}
                    weight="regular"
                />
            )}
            <Text
                style={[
                    estilos.texto,
                    contraceptiva ? estilos.textoContraceptivo : estilos.textoEducativo,
                    textStyle
                ]}
            >
                {texto}
            </Text>
        </View>
    );
}

export { CycleEducationalDisclaimer };
