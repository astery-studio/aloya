import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDown, CaretRight } from 'phosphor-react-native';
import FormField from '../../../shared/components/forms/FormField';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos } from './contraceptiveForms.styles';

function SelectorField({
    label,
    valor,
    placeholder,
    onPress,
    navegar = false,
    icone: Icone,
    corIcone = '#C85A44',
    fundoIcone = '#FDF0EC'
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const Seta = navegar ? CaretRight : CaretDown;
    return (
        <FormField
            label={label}
            campo={
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${label}: ${valor || placeholder}`}
                    onPress={onPress}
                    style={({ pressed }) => [estilos.campoSeletor, pressed && estilos.pressionado]}
                >
                    {Icone ? (
                        <View style={[estilos.caixaIconeCampo, { backgroundColor: fundoIcone }]}>
                            <Icone size={20} color={corIcone} />
                        </View>
                    ) : null}
                    <Text
                        style={[estilos.valorSeletor, !valor && estilos.placeholder]}
                        numberOfLines={2}
                    >
                        {valor || placeholder}
                    </Text>
                    <Seta size={20} color={tema.cores.interface.textoSecundario} />
                </Pressable>
            }
        />
    );
}

export { SelectorField };
