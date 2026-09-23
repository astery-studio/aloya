/**
 * Campo pressionável que exibe uma opção selecionada e abre sua lista externa.
 */
import { Pressable, Text, View } from 'react-native';
import { CaretDownIcon as CaretDown } from 'phosphor-react-native/src/icons/CaretDown';
import { cores } from '../../theme';
import { estilos } from './SelectInput.styles';

export default function SelectInput({
    valor, unidade, placeholder = 'Selecionar', aoPressionar,
    desativado = false, rotuloAcessibilidade = 'Selecionar opção', estilo
}) {
    const possuiValor = valor !== null && valor !== undefined && valor !== '';
    const texto = possuiValor
        ? `${valor}${unidade ? ` ${unidade}` : ''}`
        : placeholder;

    return (
        <Pressable accessibilityRole="button"
            accessibilityLabel={rotuloAcessibilidade}
            accessibilityValue={{ text: texto }}
            accessibilityState={{ disabled: desativado }}
            disabled={desativado} onPress={aoPressionar}
            style={({ pressed }) => [
                estilos.campo, pressed && estilos.pressionado,
                desativado && estilos.desativado, estilo
            ]}>
            <View style={estilos.conteudo}>
                <Text numberOfLines={1} style={[
                    estilos.texto, !possuiValor && estilos.placeholder
                ]}>
                    {texto}
                </Text>
                <CaretDown size={20} weight="regular"
                    color={cores.neutras.textoSecundarioClaro} />
            </View>
        </Pressable>
    );
}
