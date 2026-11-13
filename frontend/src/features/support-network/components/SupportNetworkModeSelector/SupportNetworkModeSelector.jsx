import { useMemo } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './SupportNetworkModeSelector.styles';

const OPCOES = Object.freeze([
    Object.freeze({ id: 'apoio', rotulo: 'Contatos de Apoio' }),
    Object.freeze({ id: 'acompanhados', rotulo: 'Contatos Acompanhados' })
]);

const LARGURA_SELETOR_COMPLETO = 350;
const ESPACO_HORIZONTAL_DA_LISTA = 40;

function deveCompactarSeletor(larguraTela) {
    return (
        Number.isFinite(larguraTela) &&
        larguraTela - ESPACO_HORIZONTAL_DA_LISTA < LARGURA_SELETOR_COMPLETO
    );
}

function SupportNetworkModeSelector({ selecionado = 'apoio', aoSelecionar }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const { width: larguraTela } = useWindowDimensions();
    const compacto = deveCompactarSeletor(larguraTela);

    return (
        <ScrollView
            accessibilityRole="tablist"
            accessibilityLabel="Tipo de contato da Rede de Apoio"
            contentContainerStyle={[estilos.conteudo, compacto && estilos.conteudoCompacto]}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={estilos.container}
        >
            {OPCOES.map((opcao) => {
                const estaSelecionado = selecionado === opcao.id;

                return (
                    <View
                        key={opcao.id}
                        style={[
                            estilos.containerOpcao,
                            opcao.id === 'acompanhados'
                                ? estilos.opcaoAcompanhados
                                : estilos.opcaoApoio
                        ]}
                    >
                        <Pressable
                            accessibilityRole="tab"
                            accessibilityLabel={opcao.rotulo}
                            accessibilityState={{ selected: estaSelecionado }}
                            disabled={estaSelecionado || typeof aoSelecionar !== 'function'}
                            onPress={() => aoSelecionar(opcao.id)}
                            style={({ pressed }) => [
                                estilos.botao,
                                estaSelecionado
                                    ? estilos.botaoSelecionado
                                    : estilos.botaoNaoSelecionado,
                                pressed && !estaSelecionado ? estilos.botaoPressionado : null
                            ]}
                        >
                            <Text
                                numberOfLines={1}
                                style={[
                                    estilos.texto,
                                    estaSelecionado
                                        ? estilos.textoSelecionado
                                        : estilos.textoNaoSelecionado
                                ]}
                            >
                                {opcao.rotulo}
                            </Text>
                        </Pressable>
                    </View>
                );
            })}
        </ScrollView>
    );
}

export {
    ESPACO_HORIZONTAL_DA_LISTA,
    LARGURA_SELETOR_COMPLETO,
    OPCOES,
    SupportNetworkModeSelector,
    deveCompactarSeletor
};
