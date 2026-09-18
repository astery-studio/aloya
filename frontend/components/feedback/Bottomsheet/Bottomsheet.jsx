//Mostra um painel que sobe da parte inferior da tela.

import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    View
} from 'react-native'

import { estilos } from './BottomSheet.style'

function BottomSheet({
    visivel,
    onFechar,
    children
}) {
    return (
        <Modal
            visible={visivel}
            transparent
            animationType="slide"
            onRequestClose={onFechar}
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
                    onPress={onFechar}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar painel"
                />

                <View style={estilos.painel}>
                    {children}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

export { BottomSheet }