/**
 * Mostra um painel que sobe da parte inferior da tela.
 * É usado pelos painéis de seleção e edição.
 * Existe para oferecer a mesma estrutura e animação a todos eles.
 */

import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    View
} from 'react-native'

import { estilos } from './BottomSheet.style'

/**
 * Recebe visibilidade, conteúdo e estado de salvamento.
 * Mostra o painel com a animação nativa, sem fechar pelo fundo.
 * Retorna o BottomSheet.
 */
function BottomSheet({
    visivel,
    onFechar,
    children,
    bloquearFechamento = false
}) {
    /**
     * Não recebe dados.
     * Atende ao botão Voltar do Android quando não está salvando.
     * Não retorna valor.
     */
    function solicitarFechamento() {
        if (!bloquearFechamento) {
            onFechar?.()
        }
    }

    return (
        <Modal
            visible={visivel}
            transparent
            animationType="slide"
            onRequestClose={solicitarFechamento}
        >
            <KeyboardAvoidingView
                style={estilos.tela}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : 'height'
                }
            >
                <View style={estilos.fundo} />

                <View style={estilos.painel}>
                    {children}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

export { BottomSheet }