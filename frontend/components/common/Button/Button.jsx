import { Pressable, Text } from 'react-native';
import { cores } from '../../../theme';
import { estilos, tamanhos, variantes } from './styles';

export default function Button({
    texto,
    aoPressionar,
    variante = 'laranja',
    tamanho = 'grande',
    largura = '100%',
    desativado = false,
    rotuloAcessibilidade,
    estilo
}) {
    const tamanhoAtual =
        tamanhos[tamanho] || tamanhos.grande;

    const varianteAtual =
        variantes[variante] || variantes.laranja;

    const corTexto = desativado
        ? cores.neutras.textoSecundarioClaro
        : varianteAtual.texto.color;

    return (
        <Pressable
            accessibilityLabel={rotuloAcessibilidade || texto}
            accessibilityRole="button"
            accessibilityState={{ disabled: desativado }}
            disabled={desativado}
            onPress={aoPressionar}
            style={({ pressed }) => [
                estilos.container,
                tamanhoAtual.container,
                varianteAtual.container,
                { width: largura },
                desativado && estilos.desativado,
                pressed && estilos.pressionado,
                estilo
            ]}
        >
            <Text
                numberOfLines={1}
                style={[
                    estilos.texto,
                    tamanhoAtual.texto,
                    varianteAtual.texto,
                    desativado && { color: corTexto }
                ]}
            >
                {texto}
            </Text>
        </Pressable>
    );
}