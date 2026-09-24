//Mostra um painel na parte inferior da tela
import { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, KeyboardAvoidingView, Modal, Platform } from 'react-native'
import { estilos } from './BottomSheet.style'

function BottomSheet({ visivel, onFechar, children, bloquearFechamento = false }) {
    const [alturaForaDaTela] = useState(() => Dimensions.get('screen').height)
    const [progresso] = useState(() => new Animated.Value(0))
    const [posicaoPainel] = useState(() => progresso.interpolate({
        inputRange: [0, 1],
        outputRange: [alturaForaDaTela, 0]
    }))
    const [modalMontado, setModalMontado] = useState(visivel)
    const montadoAtual = useRef(visivel)
    const visivelAtual = useRef(visivel)
    const modalJaApareceu = useRef(false)

    const animarEntrada = useCallback(() => {
        Animated.timing(progresso, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
            isInteraction: false
        }).start()
    }, [progresso])

    const animarSaida = useCallback(() => {
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
    }, [progresso])

    useEffect(() => {
        visivelAtual.current = visivel
    }, [visivel])

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
    }, [animarEntrada, animarSaida, progresso, visivel])

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
        <Modal visible={modalMontado} transparent animationType="none" onShow={quandoModalAparecer} onRequestClose={solicitarFechamento}>
            <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Animated.View pointerEvents="none" style={[estilos.fundo, { opacity: progresso }]} />
                <Animated.View style={[estilos.painel, { transform: [{ translateY: posicaoPainel }] }]}>
                    {children}
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

export { BottomSheet }