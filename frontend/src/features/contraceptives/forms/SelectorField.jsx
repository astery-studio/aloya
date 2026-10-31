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
    fundoIcone = '#FDF0EC',
    aparenciaCadastro = false,
    coresNoturnas
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const Seta = navegar ? CaretRight : CaretDown;
    const usarCoresNoturnas = tema.escuro && aparenciaCadastro;
    const corDoIcone = usarCoresNoturnas ? (coresNoturnas?.icone ?? corIcone) : corIcone;
    const fundoDoIcone = usarCoresNoturnas ? (coresNoturnas?.caixa ?? fundoIcone) : fundoIcone;
    return (
        <FormField
            label={label}
            campo={
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${label}: ${valor || placeholder}`}
                    onPress={onPress}
                    style={({ pressed }) => [
                        estilos.campoSeletor,
                        aparenciaCadastro && estilos.campoCadastro,
                        pressed && estilos.pressionado
                    ]}
                >
                    {Icone ? (
                        <View style={[estilos.caixaIconeCampo, { backgroundColor: fundoDoIcone }]}>
                            <Icone size={20} color={corDoIcone} />
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
