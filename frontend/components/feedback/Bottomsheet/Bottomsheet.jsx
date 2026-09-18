//Mostra um painel na parte inferior da tela
import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, KeyboardAvoidingView, Modal, Platform } from 'react-native'
import { estilos } from './BottomSheet.style'

function BottomSheet({ visivel, onFechar, children, bloquearFechamento = false }) {
    const alturaForaDaTela = useRef(
        Dimensions.get('screen').height
    ).current

    const progresso = useRef(
        new Animated.Value(0)
    ).current

    const [modalMontado, setModalMontado] = useState(visivel)

    const montadoAtual = useRef(visivel)
    const visivelAtual = useRef(visivel)
    const modalJaApareceu = useRef(false)

    visivelAtual.current = visivel

    const posicaoPainel = useRef(
        progresso.interpolate({
            inputRange: [0, 1],
            outputRange: [alturaForaDaTela, 0]
        })
    ).current

    function animarEntrada() {
        Animated.timing(progresso, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
            isInteraction: false
        }).start()
    }

    function animarSaida() {
        Animated.timing(progresso, {
            toValue: 0,
            duration: 220,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
            isInteraction: false
        }).start(({ finished }) => {
            if (finished && !visivelAtual.current) {
                montadoAtual.current = false
                setModalMontado(false)
            }
        })
    }

    useEffect(() => {
        if (visivel) {
            if (!montadoAtual.current) {
                montadoAtual.current = true
                progresso.setValue(0)
                setModalMontado(true)
            } else if (modalJaApareceu.current) {
                animarEntrada()
            }
            return
        }

        if (montadoAtual.current) {
            animarSaida()
        }
    }, [visivel])

    function quandoModalAparecer() {
        modalJaApareceu.current = true

        if (visivelAtual.current) {
            animarEntrada()
        }
    }

    function solicitarFechamento() {
        if (!bloquearFechamento) {
            onFechar?.()
        }
    }

    return (
        <Modal
            visible={modalMontado}
            transparent
            animationType="none"
            onShow={quandoModalAparecer}
            onRequestClose={solicitarFechamento}
        >
            <KeyboardAvoidingView
                style={estilos.tela}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Animated.View
                    pointerEvents="none"
                    style={[estilos.fundo, { opacity: progresso }]}
                />

                <Animated.View
                    style={[estilos.painel, {transform: [{ translateY: posicaoPainel }]}]}
                >
                    {children}
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

export { BottomSheet }