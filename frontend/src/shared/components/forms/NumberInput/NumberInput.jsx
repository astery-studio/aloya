/**
 * Campo numérico controlado que mantém a unidade visível e não editável.
 */
import { useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { CaretDownIcon } from '../../icons/AppIcons';
import { cores } from '../../../theme';
import { estilos } from './NumberInput.styles';

export default function NumberInput({
    valor, aoAlterar, unidade = 'Dias', desativado = false,
    rotuloAcessibilidade = 'Duração em dias', estilo
}) {
    const entradaRef = useRef(null);
    const texto = valor === null || valor === undefined ? '' : String(valor);

    function alterar(novoTexto) {
        const numeros = novoTexto.replace(/\D/g, '').slice(0, 2);
        aoAlterar?.(numeros ? Number(numeros) : null);
    }

    return (
        <Pressable accessible={false} testID="area-campo-numero" disabled={desativado}
            onPress={() => entradaRef.current?.focus()}
            style={[estilos.campo, desativado && estilos.desativado, estilo]}>
            <View style={estilos.conteudo}>
                <TextInput ref={entradaRef} accessibilityLabel={rotuloAcessibilidade}
                    editable={!desativado} keyboardType="number-pad" maxLength={2}
                    selectTextOnFocus value={texto} onChangeText={alterar}
                    style={estilos.entrada} />
                <Text style={estilos.unidade}>
                    {unidade}
                </Text>
                <CaretDownIcon
                    accessibilityElementsHidden
                    color={cores.neutras.textoSecundarioClaro}
                    size={24}
                    weight="regular"
                />
            </View>
        </Pressable>
    );
}
