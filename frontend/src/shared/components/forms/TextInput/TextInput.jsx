/**
 * Campo textual controlado que concentra variantes, sanitização e ação lateral.
 */
import { memo, useMemo, useRef } from 'react';
import { Pressable, Text, TextInput as EntradaNativa, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './TextInput.styles';

const manterTexto = (texto) => texto;

// Recebe as opções do campo, mostra a entrada e devolve o texto tratado ao formulário.
function TextInput({
    label,
    placeholder,
    value,
    onChangeText,
    variante = 'padrao',
    desativado = false,
    acaoDireita,
    estilo,
    erro,
    sanitizar = manterTexto,
    ...outrasProps
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const entradaRef = useRef(null);
    const preenchido = Boolean(value);
    const rotuloExterno = variante === 'categoria' && label;
    const rotuloInterno = variante === 'padrao' && preenchido && label;
    const corPlaceholder =
        variante === 'categoria'
            ? tema.cores.interface.textoDesabilitado
            : tema.cores.interface.textoSecundario;

    return (
        <Pressable
            accessible={false}
            testID="area-campo-texto"
            disabled={desativado}
            onPress={() => entradaRef.current?.focus()}
            style={[estilos.grupoCampo, rotuloExterno && estilos.grupo]}
        >
            {rotuloExterno && <Text style={estilos.rotuloExterno}>{label}</Text>}
            <View
                style={[
                    estilos.container,
                    preenchido && variante === 'padrao' && estilos.preenchido,
                    variante === 'categoria' && estilos.categoria,
                    variante === 'popup' && estilos.popup,
                    desativado && estilos.desativado,
                    erro && estilos.containerErro,
                    estilo
                ]}
            >
                <View style={estilos.conteudo}>
                    {rotuloInterno && <Text style={estilos.rotuloFlutuante}>{label}</Text>}
                    <EntradaNativa
                        ref={entradaRef}
                        accessibilityLabel={label || placeholder}
                        editable={!desativado}
                        placeholder={rotuloInterno ? undefined : placeholder}
                        placeholderTextColor={corPlaceholder}
                        selectionColor={tema.cores.interface.destaque}
                        value={value}
                        onChangeText={(texto) => onChangeText?.(sanitizar(texto))}
                        style={estilos.entrada}
                        {...outrasProps}
                    />
                </View>
                {acaoDireita}
            </View>
            {erro ? (
                <Text accessibilityRole="alert" style={estilos.erro}>
                    {erro}
                </Text>
            ) : null}
        </Pressable>
    );
}

export default memo(TextInput);
