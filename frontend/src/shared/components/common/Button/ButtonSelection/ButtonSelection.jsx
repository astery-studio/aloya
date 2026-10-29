// Mostra uma opção selecionável usada em listas e painéis.
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';

import { useTheme } from '../../../../hooks/useTheme';
import { criarEstilos } from './ButtonSelection.style';

function ButtonSelection({
    label,
    selected = false,
    onPress,
    icone: Icone,
    descricao,
    desabilitado = false,
    variante = 'lista'
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const intensidade = variante === 'intensidade';

    const corIcone = selected ? tema.cores.interface.destaque : tema.cores.interface.textoPrincipal;

    return (
        <Pressable
            onPress={onPress}
            disabled={desabilitado}
            accessibilityRole="button"
            accessibilityState={{
                selected,
                disabled: desabilitado
            }}
            style={[
                estilos.container,
                intensidade && estilos.intensidade,
                selected && estilos.selecionado,
                intensidade && selected && estilos.intensidadeSelecionada,
                desabilitado && estilos.desabilitado
            ]}
        >
            {Icone ? <Icone size={24} color={corIcone} /> : null}

            <View style={estilos.textos}>
                <Text style={[estilos.label, selected && estilos.labelSelecionado]}>{label}</Text>

                {descricao ? <Text style={estilos.descricao}>{descricao}</Text> : null}
            </View>

            {intensidade ? (
                selected ? (
                    <CheckCircle size={26} weight="fill" color={tema.cores.interface.destaque} />
                ) : (
                    <View testID="radio-selecao-vazio" style={estilos.radioVazio} />
                )
            ) : null}
        </Pressable>
    );
}

export { ButtonSelection };
