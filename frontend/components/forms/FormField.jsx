import { Text, View } from 'react-native';
import { estilos } from './FormField.styles';

export default function FormField({
    label, campo, children, mensagemAuxiliar, estilo
}) {
    return (
        <View style={[estilos.container, estilo]}>
            {label ? <Text style={estilos.label}>{label}</Text> : null}
            {campo ?? children}
            {mensagemAuxiliar ? (
                <Text style={estilos.mensagemAuxiliar}>
                    {mensagemAuxiliar}
                </Text>
            ) : null}
        </View>
    );
}
