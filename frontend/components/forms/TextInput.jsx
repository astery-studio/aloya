import { Text, TextInput as EntradaNativa, View } from 'react-native';
import { cores } from '../../theme';
import { estilos } from './TextInput.styles';

// Recebe as opções do campo, mostra a entrada e devolve o texto tratado ao formulário.
export default function TextInput({
    label, placeholder, value, onChangeText, variante = 'padrao',
    desativado = false, acaoDireita, iconeEsquerda: IconeEsquerda, corIcone = '#C85A44', fundoIcone = 'transparent', estilo, sanitizar = (texto) => texto,
    ...outrasProps
}) {
    const preenchido = Boolean(value);
    const rotuloExterno = ['categoria', 'anticoncepcional'].includes(variante) && label;
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
                variante === 'anticoncepcional' && estilos.anticoncepcional,
                variante === 'popup' && estilos.popup,
                desativado && estilos.desativado,
                estilo
            ]}>
                {IconeEsquerda ? <View style={[estilos.caixaIcone, { backgroundColor: fundoIcone }]}><IconeEsquerda size={18} color={corIcone} /></View> : null}
                <View style={estilos.conteudo}>
                    {rotuloInterno && <Text style={estilos.rotuloFlutuante}>{label}</Text>}
                    <EntradaNativa
                        accessibilityLabel={label || placeholder}
                        editable={!desativado}
                        placeholder={rotuloInterno ? undefined : placeholder}
                        placeholderTextColor={corPlaceholder}
                        value={value}
                        onChangeText={(texto) => onChangeText?.(sanitizar(texto))}
                        style={estilos.entrada}
                        {...outrasProps}
                    />
                </View>
                {acaoDireita}
            </View>
        </View>
    );
}
