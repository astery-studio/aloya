import { Text, TextInput as EntradaNativa, View } from 'react-native';
import { cores } from '../../theme';
import { estilos } from './TextInput.styles';

export default function TextInput({
    label, placeholder, value, onChangeText, variante = 'padrao',
    desativado = false, acaoDireita, estilo, ...outrasProps
}) {
    const preenchido = Boolean(value);
    const rotuloExterno = variante === 'categoria' && label;
    const rotuloInterno = variante === 'padrao' && preenchido && label;
    const corPlaceholder = variante === 'categoria' ? '#A8A49C'
        : variante === 'popup' ? 'rgba(34, 34, 34, 0.50)'
            : cores.neutras.textoSecundarioClaro;

    return (
        <View style={rotuloExterno && estilos.grupo}>
            {rotuloExterno && <Text style={estilos.rotuloExterno}>{label}</Text>}
            <View style={[
                estilos.container,
                preenchido && variante === 'padrao' && estilos.preenchido,
                variante === 'categoria' && estilos.categoria,
                variante === 'popup' && estilos.popup,
                desativado && estilos.desativado,
                estilo
            ]}>
                <View style={estilos.conteudo}>
                    {rotuloInterno && <Text style={estilos.rotuloFlutuante}>{label}</Text>}
                    <EntradaNativa
                        accessibilityLabel={label || placeholder}
                        editable={!desativado}
                        placeholder={rotuloInterno ? undefined : placeholder}
                        placeholderTextColor={corPlaceholder}
                        value={value}
                        onChangeText={onChangeText}
                        style={estilos.entrada}
                        {...outrasProps}
                    />
                </View>
                {acaoDireita}
            </View>
        </View>
    );
}
