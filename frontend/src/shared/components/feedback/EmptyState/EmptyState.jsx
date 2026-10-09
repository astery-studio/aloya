import { Text, View } from 'react-native';
import { estilos } from './EmptyState.styles';

const variantesPermitidas = Object.freeze(['vazio', 'erro', 'apresentacao']);

function EmptyState({ titulo, mensagem, acao, variante = 'vazio' }) {
    if (!variantesPermitidas.includes(variante)) {
        throw new Error(`Variante de EmptyState inválida: ${variante}`);
    }

    return (
        <View style={[estilos.container, estilos[variante]]}>
            <View style={estilos.textos}>
                <Text accessibilityRole="header" style={[estilos.titulo, estilos[`titulo_${variante}`]]}>
                    {titulo}
                </Text>
                <Text style={[estilos.mensagem, estilos[`mensagem_${variante}`]]}>
                    {mensagem}
                </Text>
            </View>
            {acao ? <View style={estilos.acao}>{acao}</View> : null}
        </View>
    );
}

export { EmptyState };
