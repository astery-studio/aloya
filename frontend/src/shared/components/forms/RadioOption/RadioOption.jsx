/**
 * Representa uma opção única selecionável com estado visual e acessibilidade.
 */
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CheckIcon as Check } from 'phosphor-react-native/src/icons/Check';
import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './RadioOption.styles';

export default function RadioOption({
    titulo,
    descricao,
    selecionado = false,
    aoPressionar,
    desativado = false,
    estilo
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityLabel={titulo}
            accessibilityState={{ selected: selecionado, disabled: desativado }}
            disabled={desativado}
            onPress={aoPressionar}
            style={({ pressed }) => [
                estilos.opcao,
                selecionado && estilos.selecionada,
                pressed && estilos.pressionado,
                desativado && estilos.desativado,
                estilo
            ]}
        >
            <View style={estilos.textos}>
                <Text style={[estilos.titulo, selecionado && estilos.tituloSelecionado]}>
                    {titulo}
                </Text>
                {descricao && <Text style={estilos.descricao}>{descricao}</Text>}
            </View>
            <View style={[estilos.indicador, selecionado && estilos.indicadorSelecionado]}>
                {selecionado && <Check size={12} color={tema.cores.interface.textoSobreDestaque} />}
            </View>
        </Pressable>
    );
}
