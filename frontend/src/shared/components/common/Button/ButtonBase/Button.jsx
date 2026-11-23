/**
 * Componente base dos botões, responsável por variantes,
 * estados, ícones e acessibilidade.
 */
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useTheme } from '../../../../hooks/useTheme';
import { criarEstilos, criarTamanhos, criarVariantes } from './Button.styles';

function Button({
    texto,
    aoPressionar,
    variante = 'laranja',
    tamanho = 'grande',
    largura = '100%',
    desativado = false,
    carregando = false,
    icone: Icone,
    tamanhoIcone = 18,
    corConteudo: corConteudoPersonalizada,
    posicaoIcone = 'esquerda',
    rotuloAcessibilidade,
    estilo,
    estiloTexto
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const tamanhos = useMemo(() => criarTamanhos(tema), [tema]);

    const variantes = useMemo(() => criarVariantes(tema), [tema]);

    if (!tamanhos[tamanho]) {
        throw new Error(`Tamanho de Button inválido: ${tamanho}`);
    }

    if (!variantes[variante]) {
        throw new Error(`Variante de Button inválida: ${variante}`);
    }

    const tamanhoAtual = tamanhos[tamanho];

    const varianteAtual = variantes[variante];

    const bloqueado = desativado || carregando;

    const corConteudo = desativado
        ? tema.escuro
            ? '#757575'
            : tema.cores.interface.textoDesabilitado
        : corConteudoPersonalizada || varianteAtual.texto.color;

    function renderizarConteudo() {
        if (carregando) {
            return <ActivityIndicator testID="button-loading" color={corConteudo} />;
        }

        return (
            <View style={estilos.conteudo}>
                {Icone && posicaoIcone === 'esquerda' ? (
                    <View style={estilos.caixaIcone}>
                        <Icone color={corConteudo} size={tamanhoIcone} />
                    </View>
                ) : null}

                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                    style={[
                        estilos.texto,
                        tamanhoAtual.texto,
                        varianteAtual.texto,
                        desativado
                            ? {
                                  color: corConteudo
                              }
                            : null,
                        estiloTexto
                    ]}
                >
                    {texto}
                </Text>

                {Icone && posicaoIcone === 'direita' ? (
                    <View style={estilos.caixaIcone}>
                        <Icone color={corConteudo} size={tamanhoIcone} />
                    </View>
                ) : null}
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
                {
                    width: largura
                },
                desativado && estilos.desativado,
                pressed && estilos.pressionado,
                estilo
            ]}
        >
            {renderizarConteudo()}
        </Pressable>
    );
}

export default Button;
