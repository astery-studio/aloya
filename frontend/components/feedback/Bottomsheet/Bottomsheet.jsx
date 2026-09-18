/**
 * Mostra um painel na parte inferior da tela.
 * É usado pelos painéis de seleção e edição.
 * Existe para controlar abertura, fechamento e animação sem conhecer o conteúdo.
 */

import { useEffect, useRef, useState } from 'react'
import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    useWindowDimensions
} from 'react-native'

import { estilos } from './BottomSheet.style'

/**
 * Recebe visibilidade, conteúdo e regras de fechamento.
 * Mantém o fundo parado e anima somente o painel.
 * Retorna a estrutura do BottomSheet.
 */
function BottomSheet({
    visivel,
    onFechar,
    children,
    fecharAoTocarFora = false,
    bloquearFechamento = false
}) {
    const { height: alturaTela } = useWindowDimensions()

    const [modalMontado, setModalMontado] =
        useState(visivel)

    const deslocamento = useRef(
        new Animated.Value(alturaTela)
    ).current

    const podeFecharFora =
        fecharAoTocarFora
        && !bloquearFechamento
        && visivel

    // Animated.Value guarda a posição do painel entre as renderizações.
    // O driver nativo executa o movimento sem recalcular a tela a cada quadro.
    useEffect(() => {
        let quadroDeAbertura

        if (visivel) {
            setModalMontado(true)
            deslocamento.stopAnimation()
            deslocamento.setValue(alturaTela)

            quadroDeAbertura = requestAnimationFrame(() => {
                Animated.timing(deslocamento, {
                    toValue: 0,
                    duration: 260,
                    useNativeDriver: true
                }).start()
            })
        } else if (modalMontado) {
            deslocamento.stopAnimation()

            Animated.timing(deslocamento, {
                toValue: alturaTela,
                duration: 220,
                useNativeDriver: true
            }).start(({ finished }) => {
                if (finished) {
                    setModalMontado(false)
                }
            })
        }

        /**
         * Não recebe dados.
         * Cancela uma animação pendente quando a visibilidade muda.
         * Não retorna valor.
         */
        function limparAnimacao() {
            if (quadroDeAbertura) {
                cancelAnimationFrame(quadroDeAbertura)
            }

            deslocamento.stopAnimation()
        }

        return limparAnimacao
    }, [visivel, alturaTela, deslocamento])

    /**
     * Não recebe dados.
     * Solicita o fechamento apenas quando não está salvando.
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

                <Animated.View
                    style={[
                        estilos.painel,
                        {
                            transform: [
                                { translateY: deslocamento }
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