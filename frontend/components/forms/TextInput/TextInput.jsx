/**
 * Campo textual controlado que concentra variantes, sanitização e ação lateral.
 */
import { memo, useRef } from 'react';
import { Pressable, Text, TextInput as EntradaNativa, View } from 'react-native';
import { cores } from '../../../theme';
import { estilos } from './TextInput.styles';

const manterTexto = (texto) => texto;

// Recebe as opções do campo, mostra a entrada e devolve o texto tratado ao formulário.
function TextInput({
    label, placeholder, value, onChangeText, variante = 'padrao',
    desativado = false, acaoDireita, estilo, erro, sanitizar = manterTexto,
    testeId = 'area-campo-texto', ...outrasProps
}) {
    const entradaRef = useRef(null);
    const preenchido = Boolean(value);
    const rotuloExterno = variante === 'categoria' && label;
    const rotuloInterno = variante === 'padrao' && preenchido && label;
    const corPlaceholder = variante === 'categoria' ? '#A8A49C'
        : variante === 'popup' ? 'rgba(34, 34, 34, 0.50)'
            : cores.neutras.textoSecundarioClaro;

    return (
        <View style={[estilos.grupoCampo, rotuloExterno && estilos.grupo]}>
            {rotuloExterno && <Text style={estilos.rotuloExterno}>{label}</Text>}
            <Pressable accessible={false} testID={testeId}
                disabled={desativado} onPress={() => entradaRef.current?.focus()}
                style={[
                estilos.container,
                preenchido && variante === 'padrao' && estilos.preenchido,
                variante === 'categoria' && estilos.categoria,
                variante === 'popup' && estilos.popup,
                desativado && estilos.desativado,
                erro && estilos.containerErro,
                estilo
            ]}>
                <View style={estilos.conteudo}>
                    {rotuloInterno && <Text style={estilos.rotuloFlutuante}>{label}</Text>}
                    <EntradaNativa
                        ref={entradaRef}
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
            </Pressable>
            {erro ? (
                <Text accessibilityRole="alert" style={estilos.erro}>
                    {erro}
                </Text>
            ) : null}
        </View>
    );
}

export default memo(TextInput);
