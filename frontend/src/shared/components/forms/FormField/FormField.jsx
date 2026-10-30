/**
 * Agrupa rótulo, conteúdo e mensagem auxiliar em uma estrutura de formulário.
 */
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './FormField.styles';

export default function FormField({
    label,
    campo,
    children,
    mensagemAuxiliar,
    tituloSecao = false,
    estilo,
    estiloConteudo
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    return (
        <View style={[estilos.container, estilo]}>
            {label ? (
                <Text
                    accessibilityRole={tituloSecao ? 'header' : undefined}
                    style={[estilos.label, tituloSecao && estilos.labelSecao]}
                >
                    {label}
                </Text>
            ) : null}
            <View style={[estilos.conteudo, estiloConteudo]}>{campo ?? children}</View>
            {mensagemAuxiliar ? (
                <Text style={estilos.mensagemAuxiliar}>{mensagemAuxiliar}</Text>
            ) : null}
        </View>
    );
}
