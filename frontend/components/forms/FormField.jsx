import { Text, View } from 'react-native';
import { estilos } from './FormField.styles';

export default function FormField({
    label, campo, children, mensagemAuxiliar,
    variante = 'anticoncepcional', estilo, estiloConteudo
}) {
    const labelComRecuo = variante === 'conta' || variante === 'perfil';

    return (
        <View style={[estilos.container, estilo]}>
            {label ? (
                <Text style={[
                    estilos.label,
                    labelComRecuo && estilos.labelComRecuo,
                    variante === 'conta' && estilos.labelConta
                ]}>
                    {label}
                </Text>
            ) : null}
            <View style={[
                estilos.conteudo,
                variante === 'perfil' && estilos.conteudoPerfil,
                estiloConteudo
            ]}>
                {campo ?? children}
            </View>
            {mensagemAuxiliar ? (
                <Text style={estilos.mensagemAuxiliar}>
                    {mensagemAuxiliar}
                </Text>
            ) : null}
        </View>
    );
}
