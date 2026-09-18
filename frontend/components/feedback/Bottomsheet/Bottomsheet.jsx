/**
 * Mostra um painel na parte inferior da tela.
 * É usado pelos painéis de seleção e edição.
 * Existe para animar somente o painel, sem deslocar o fundo da tela.
 */

import { useEffect, useRef, useState } from 'react'

import {
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Modal,
    Platform
} from 'react-native'

import { estilos } from './BottomSheet.style'

/**
 * Recebe visibilidade, conteúdo, ação de fechar e estado de salvamento.
 * Anima o painel para cima ou para baixo e escurece o fundo sem movê-lo.
 * Retorna o BottomSheet.
 */
function BottomSheet({
    visivel,
    onFechar,
    children,
    bloquearFechamento = false
}) {
    const alturaForaDaTela = useRef(
        Dimensions.get('screen').height
    ).current

    const progresso = useRef(
        new Animated.Value(0)
    ).current

    const [modalMontado, setModalMontado] =
        useState(visivel)

    const montadoAtual = useRef(visivel)
    const visivelAtual = useRef(visivel)
    const modalJaApareceu = useRef(false)

    visivelAtual.current = visivel

    // Interpolação converte o progresso de 0 a 1 em uma posição.
    // Em 0, o painel está fora da tela; em 1, está no lugar.
    const posicaoPainel = useRef(
        progresso.interpolate({
            inputRange: [0, 1],
            outputRange: [alturaForaDaTela, 0]
        })
    ).current

    /**
     * Não recebe dados.
     * Faz o painel subir depois que o Modal está pronto.
     * Não retorna valor.
     */
    function animarEntrada() {
        Animated.timing(progresso, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
            isInteraction: false
        }).start()
    }

    /**
     * Não recebe dados.
     * Faz o painel descer e desmonta o Modal ao terminar.
     * Não retorna valor.
     */
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

    // useEffect reage somente à abertura ou ao fechamento.
    // Digitar, abrir o teclado e atualizar o conteúdo não reiniciam a animação.
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

    /**
     * Não recebe dados.
     * Inicia a subida quando o Modal termina de aparecer.
     * Não retorna valor.
     */
    function quandoModalAparecer() {
        modalJaApareceu.current = true

        if (visivelAtual.current) {
            animarEntrada()
        }
    }

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
            visible={modalMontado}
            transparent
            animationType="none"
            onShow={quandoModalAparecer}
            onRequestClose={solicitarFechamento}
        >
            <KeyboardAvoidingView
                style={estilos.tela}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <Animated.View
                    pointerEvents="none"
                    style={[
                        estilos.fundo,
                        { opacity: progresso }
                    ]}
                />

                <Animated.View
                    style={[
                        estilos.painel,
                        {
                            transform: [
                                { translateY: posicaoPainel }
                            ]
                        }
                    ]}
                >
                    {children}
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

export { BottomSheet }