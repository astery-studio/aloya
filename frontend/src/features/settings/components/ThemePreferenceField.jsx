import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';

import { MoonIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { PREFERENCIAS_TEMA, preferenciaTemaEhValida } from '../../../shared/theme/themePreferences';
import { criarEstilos } from './ThemePreferenceField.styles';

const ROTULOS_PREFERENCIA_TEMA = Object.freeze({
    [PREFERENCIAS_TEMA.claro]: 'Claro',

    [PREFERENCIAS_TEMA.escuro]: 'Escuro',

    [PREFERENCIAS_TEMA.automatico]: 'Automático'
});

function obterRotuloPreferencia(preferencia) {
    if (!preferenciaTemaEhValida(preferencia)) {
        return ROTULOS_PREFERENCIA_TEMA[PREFERENCIAS_TEMA.automatico];
    }

    return ROTULOS_PREFERENCIA_TEMA[preferencia];
}

function ThemePreferenceField({
    preferencia = PREFERENCIAS_TEMA.automatico,
    salvando = false,
    onPress
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const rotulo = obterRotuloPreferencia(preferencia);

    const desabilitado = salvando || typeof onPress !== 'function';

    return (
        <Pressable
            onPress={onPress}
            disabled={desabilitado}
            accessibilityRole="button"
            accessibilityLabel={`Modo de Cor: ${rotulo}`}
            accessibilityHint="Abre as opções de tema do aplicativo"
            accessibilityState={{
                disabled: desabilitado,
                busy: salvando
            }}
            style={[estilos.container, desabilitado && estilos.desabilitado]}
        >
            <View style={estilos.caixaIcone}>
                <MoonIcon
                    size={24}
                    color={tema.cores.icones.configuracoes.azul.icone}
                    weight="regular"
                />
            </View>

            <Text style={estilos.label} numberOfLines={1}>
                Modo de Cor
            </Text>

            <CaretRightIcon
                size={20}
                color={tema.cores.interface.textoDesabilitado}
                weight="regular"
            />
        </Pressable>
    );
}

export { ROTULOS_PREFERENCIA_TEMA, ThemePreferenceField, obterRotuloPreferencia };

export default ThemePreferenceField;
