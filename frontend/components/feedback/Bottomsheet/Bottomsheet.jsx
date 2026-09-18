//Mostra um painel na parte inferior da tela.

import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native'
import { estilos } from './BottomSheet.style'

function BottomSheet({
    visivel,
    onFechar,
    children,
    fecharAoTocarFora = false,
    bloquearFechamento = false
}) {
    const podeFecharFora =
        fecharAoTocarFora && !bloquearFechamento

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
                <Pressable
                    style={estilos.fundo}
                    onPress={
                        podeFecharFora
                            ? solicitarFechamento
                            : undefined
                    }
                    disabled={!podeFecharFora}
                    accessibilityRole="button"
                    accessibilityLabel="Área fora do painel"
                />

                <View style={estilos.painel}>
                    {children}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

export { BottomSheet }