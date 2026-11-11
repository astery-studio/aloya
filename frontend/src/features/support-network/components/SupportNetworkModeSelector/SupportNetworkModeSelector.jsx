import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './SupportNetworkModeSelector.styles';

const OPCOES = Object.freeze([
    Object.freeze({ id: 'apoio', rotulo: 'Contatos de Apoio' }),
    Object.freeze({ id: 'acompanhados', rotulo: 'Contatos Acompanhados' })
]);

const LARGURA_SELETOR_COMPLETO = 350;

function SupportNetworkModeSelector({ selecionado = 'apoio', aoSelecionar }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [compacto, setCompacto] = useState(false);

    const medirSeletor = useCallback((evento) => {
        const largura = evento?.nativeEvent?.layout?.width;

        if (Number.isFinite(largura)) {
            setCompacto(largura < LARGURA_SELETOR_COMPLETO);
        }
    }, []);

    return (
        <ScrollView
            accessibilityRole="tablist"
            accessibilityLabel="Tipo de contato da Rede de Apoio"
            contentContainerStyle={[estilos.conteudo, compacto && estilos.conteudoCompacto]}
            horizontal
            onLayout={medirSeletor}
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

export { LARGURA_SELETOR_COMPLETO, OPCOES, SupportNetworkModeSelector };
