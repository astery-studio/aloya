// Mostra um painel na parte inferior da tela.
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../hooks/useTheme';
import { deveFecharPorArraste, deveIniciarArraste } from './bottomSheetGesture';
import { criarEstilos } from './BottomSheet.style';

function BottomSheet({
    visivel,
    onFechar,
    onOcultar,
    children,
    bloquearFechamento = false,
    corPainel,
    estiloPainel,
    permitirDeslizarParaFechar = false
}) {
    const tema = useTheme();
    const insets = useSafeAreaInsets();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const alturaForaDaTela = useRef(Dimensions.get('screen').height).current;

    const progresso = useRef(new Animated.Value(0)).current;
    const deslocamentoArraste = useRef(new Animated.Value(0)).current;

    const [modalMontado, setModalMontado] = useState(visivel);

    const montadoAtual = useRef(visivel);

    const visivelAtual = useRef(visivel);

    const modalJaApareceu = useRef(false);
    const ocultamentoNotificado = useRef(false);
    visivelAtual.current = visivel;

    const posicaoPainel = useRef(
        progresso.interpolate({
            inputRange: [0, 1],
            outputRange: [alturaForaDaTela, 0]
        })
    ).current;

    function animarEntrada() {
        ocultamentoNotificado.current = false;
        deslocamentoArraste.setValue(0);
        Animated.timing(progresso, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
            isInteraction: false
        }).start();
    }

    function notificarOcultamento() {
        if (visivelAtual.current || ocultamentoNotificado.current) {
            return;
        }

        ocultamentoNotificado.current = true;
        onOcultar?.();
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
                montadoAtual.current = false;
                setModalMontado(false);

                if (Platform.OS !== 'ios') {
                    notificarOcultamento();
                }
            }
        });
    }

    useEffect(() => {
        if (visivel) {
            if (!montadoAtual.current) {
                montadoAtual.current = true;
                progresso.setValue(0);
                setModalMontado(true);
            } else if (modalJaApareceu.current) {
                animarEntrada();
            }
            return;
        }

        if (montadoAtual.current) {
            animarSaida();
        }

        // As funções de animação são recriadas durante o render.
        // Incluí-las reiniciaria a animação sem mudança de visibilidade.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visivel]);

    function quandoModalAparecer() {
        modalJaApareceu.current = true;

        if (visivelAtual.current) {
            animarEntrada();
        }
    }

    function solicitarFechamento() {
        if (!bloquearFechamento) {
            onFechar?.();
        }
    }

    const responderArraste = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gesto) =>
                    permitirDeslizarParaFechar &&
                    deveIniciarArraste(gesto, bloquearFechamento),
                onPanResponderMove: (_, gesto) =>
                    deslocamentoArraste.setValue(Math.max(0, gesto.dy)),
                onPanResponderRelease: (_, gesto) => {
                    if (deveFecharPorArraste(gesto)) {
                        solicitarFechamento();
                        return;
                    }
                    Animated.spring(deslocamentoArraste, {
                        toValue: 0,
                        useNativeDriver: true
                    }).start();
                },
                onPanResponderTerminate: () =>
                    Animated.spring(deslocamentoArraste, {
                        toValue: 0,
                        useNativeDriver: true
                    }).start()
            }),
        [bloquearFechamento, deslocamentoArraste, permitirDeslizarParaFechar]
    );

    return (
        <Modal
            visible={modalMontado}
            transparent
            animationType="none"
            onShow={quandoModalAparecer}
            onDismiss={notificarOcultamento}
            onRequestClose={solicitarFechamento}
        >
            <KeyboardAvoidingView
                style={estilos.tela}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Animated.View
                    testID="bottom-sheet-fundo"
                    pointerEvents="none"
                    style={[
                        estilos.fundo,
                        {
                            opacity: progresso
                        }
                    ]}
                />

                <Animated.View
                    testID="bottom-sheet-painel"
                    onAccessibilityEscape={solicitarFechamento}
                    {...responderArraste.panHandlers}
                    style={[
                        estilos.painel,
                        {
                            paddingBottom: Math.max(tema.espacamentos.grande, insets.bottom)
                        },
                        corPainel ? { backgroundColor: corPainel } : null,
                        estiloPainel,
                        {
                            transform: [
                                {
                                    translateY: Animated.add(posicaoPainel, deslocamentoArraste)
                                }
                            ]
                        }
                    ]}
                >
                    {children}
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export { BottomSheet };
