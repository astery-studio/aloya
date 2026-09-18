/**
 * Organiza o título e o controle de fechamento do painel.
 * É usado por SelectionSheet e EditFieldSheet.
 * Existe para manter o mesmo cabeçalho em todos os painéis.
 */

import { useRef } from 'react'
import {
    PanResponder,
    Pressable,
    Text,
    View
} from 'react-native'

import { XIcon } from 'phosphor-react-native/src/icons/X'

import {
    estilos,
    corIconeFechar
} from './BottomSheetLayout.style'

/**
 * Recebe título, tipo de cabeçalho e ação de fechar.
 * Mostra X ou tracinho; no tracinho, aceita toque e gesto para baixo.
 * Retorna a organização interna do painel.
 */
function BottomSheetLayout({
    titulo,
    cabecalho = 'alca',
    onFechar,
    bloquearFechamento = false,
    children
}) {
    const mostraBotaoFechar =
        cabecalho === 'fechar'

    // Estas referências deixam o gesto usar sempre as propriedades atuais.
    const fecharAtual = useRef(onFechar)
    const bloqueadoAtual = useRef(bloquearFechamento)

    fecharAtual.current = onFechar
    bloqueadoAtual.current = bloquearFechamento

    /**
     * Não recebe dados.
     * Fecha pelo toque no controle visível quando não está salvando.
     * Não retorna valor.
     */
    function fecharPeloToque() {
        if (!bloqueadoAtual.current) {
            fecharAtual.current?.()
        }
    }

    // PanResponder reconhece um movimento do dedo.
    // Ele só assume o gesto iniciado na região do tracinho.
    const gestoAlca = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture:
                (_, gesto) => (
                    !bloqueadoAtual.current
                    && gesto.dy > 12
                    && Math.abs(gesto.dy) >
                        Math.abs(gesto.dx)
                ),

            onPanResponderRelease: (_, gesto) => {
                const deslizouOuficiente =
                    gesto.dy > 70
                    || gesto.vy > 0.7

                if (
                    !bloqueadoAtual.current
                    && deslizouOuficiente
                ) {
                    fecharAtual.current?.()
                }
            }
        })
    ).current

    return (
        <View style={estilos.container}>
            {mostraBotaoFechar ? (
                <View style={estilos.cabecalhoComFechar}>
                    <Text style={estilos.tituloEsquerda}>
                        {titulo}
                    </Text>

                    <Pressable
                        onPress={fecharPeloToque}
                        disabled={bloquearFechamento}
                        accessibilityRole="button"
                        accessibilityLabel="Fechar painel"
                        style={estilos.botaoFechar}
                    >
                        <XIcon
                            size={24}
                            color={corIconeFechar}
                            weight="regular"
                        />
                    </Pressable>
                </View>
            ) : (
                <View style={estilos.cabecalhoComAlca}>
                    <View
                        style={estilos.areaAlca}
                        {...gestoAlca.panHandlers}
                    >
                        <Pressable
                            onPress={fecharPeloToque}
                            disabled={bloquearFechamento}
                            accessibilityRole="button"
                            accessibilityLabel="Fechar painel"
                            accessibilityHint={
                                'Toque ou deslize para baixo.'
                            }
                            style={estilos.toqueAlca}
                        >
                            <View style={estilos.alca} />
                        </Pressable>
                    </View>

                    <Text style={estilos.tituloCentral}>
                        {titulo}
                    </Text>
                </View>
            )}

            <View style={estilos.conteudo}>
                {children}
            </View>
        </View>
    )
}

export { BottomSheetLayout }