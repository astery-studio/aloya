import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { cores } from '../../../theme';
import { estilos, tamanhos, variantes } from './Button.styles';

export default function Button({
    texto,
    aoPressionar,
    variante = 'laranja',
    tamanho = 'grande',
    largura = '100%',
    desativado = false,
    carregando = false,
    icone: Icone,
    posicaoIcone = 'esquerda',
    rotuloAcessibilidade,
    estilo
}) {
    if (!tamanhos[tamanho]) {
        throw new Error(`Tamanho de Button inválido: ${tamanho}`);
    }

    if (!variantes[variante]) {
        throw new Error(`Variante de Button inválida: ${variante}`);
    }

    const tamanhoAtual = tamanhos[tamanho];
    const varianteAtual = variantes[variante];

    const bloqueado =
        desativado || carregando;

    const corConteudo = desativado
        ? cores.neutras.textoSecundarioClaro
        : varianteAtual.texto.color;

    function renderizarConteudo() {
        if (carregando) {
            return (
                <ActivityIndicator
                    color={corConteudo}
                />
            );
        }

        return (
            <View style={estilos.conteudo}>
                {Icone && posicaoIcone === 'esquerda' && (
                    <Icone
                        color={corConteudo}
                        size={18}
                    />
                )}

                <Text
                    numberOfLines={1}
                    style={[
                        estilos.texto,
                        tamanhoAtual.texto,
                        varianteAtual.texto,
                        desativado && {
                            color: corConteudo
                        }
                    ]}
                >
                    {texto}
                </Text>

                {Icone && posicaoIcone === 'direita' && (
                    <Icone
                        color={corConteudo}
                        size={18}
                    />
                )}
            </View>
        );
    }

    return (
        <Pressable
            accessibilityLabel={rotuloAcessibilidade || texto}
            accessibilityRole="button"
            accessibilityState={{
                disabled: bloqueado,
                busy: carregando
            }}
            disabled={bloqueado}
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
            {renderizarConteudo()}
        </Pressable>
    );
}
