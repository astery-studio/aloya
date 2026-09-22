/**
 * Mostra um pop-up temporário para testar sua animação.
 * É usado somente durante o desenvolvimento no Expo.
 * Existe para avaliar fluidez antes dos modais definitivos serem criados.
 */

import {
    Animated,
    Easing,
    Modal,
    Pressable,
    Text,
    View
} from 'react-native'

import {
    useEffect,
    useRef,
    useState
} from 'react'

import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts
} from '@expo-google-fonts/dm-sans'

import { LockIcon } from 'phosphor-react-native/src/icons/Lock'

import { useModal } from './hooks/useModal'
import { fontFamilies, tema } from './theme'

/**
 * Não recebe propriedades.
 * Mostra e anima um pop-up simples de sucesso.
 * Retorna a tela temporária de teste.
 */
export default function App() {
    const [fontesCarregadas, erroFontes] =
        useFonts({
            DMSans_400Regular,
            DMSans_500Medium,
            DMSans_600SemiBold,
            DMSans_700Bold
        })

    const modalSucesso = useModal()

    const [modalMontado, setModalMontado] =
        useState(false)

    const progresso =
        useRef(new Animated.Value(0)).current

    const modalMontadoAtual =
        useRef(false)

    const modalVisivelAtual =
        useRef(false)

    modalVisivelAtual.current =
        modalSucesso.visivel

    const opacidadeFundo =
        progresso.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        })

    const escalaCartao =
        progresso.interpolate({
            inputRange: [0, 1],
            outputRange: [0.94, 1]
        })

    const posicaoCartao =
        progresso.interpolate({
            inputRange: [0, 1],
            outputRange: [12, 0]
        })

    /**
     * Não recebe dados.
     * Faz somente o cartão aparecer com movimento curto e leve.
     * Não retorna valor.
     */
    function animarEntrada() {
        progresso.stopAnimation()
        progresso.setValue(0)

        Animated.timing(progresso, {
            toValue: 1,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
            isInteraction: false
        }).start()
    }

    /**
     * Não recebe dados.
     * Faz o cartão desaparecer antes de desmontar o Modal.
     * Não retorna valor.
     */
    function animarSaida() {
        progresso.stopAnimation()

        Animated.timing(progresso, {
            toValue: 0,
            duration: 170,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
            isInteraction: false
        }).start(({ finished }) => {
            if (
                finished
                && !modalVisivelAtual.current
            ) {
                modalMontadoAtual.current = false
                setModalMontado(false)
            }
        })
    }

    // useEffect reage à abertura e ao fechamento do hook.
    // O Modal continua montado durante a animação de saída.
    useEffect(() => {
        if (modalSucesso.visivel) {
            if (!modalMontadoAtual.current) {
                modalMontadoAtual.current = true
                setModalMontado(true)
            } else {
                animarEntrada()
            }

            return
        }

        if (modalMontadoAtual.current) {
            animarSaida()
        }
    }, [modalSucesso.visivel])

    /**
     * Não recebe dados.
     * Inicia a animação depois que o Modal nativo aparece.
     * Não retorna valor.
     */
    function quandoModalAparecer() {
        if (modalVisivelAtual.current) {
            animarEntrada()
        }
    }

    if (erroFontes) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24
                }}
            >
                <Text>
                    Não foi possível carregar as fontes.
                </Text>
            </View>
        )
    }

    if (!fontesCarregadas) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Text>
                    Carregando fontes...
                </Text>
            </View>
        )
    }

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 24,
                backgroundColor:
                    tema.cores.neutras.fundoClaro
            }}
        >
            <Text
                style={{
                    marginBottom: 8,
                    color:
                        tema.cores.neutras
                            .textoPrincipalClaro,
                    fontFamily: fontFamilies.bold,
                    fontSize: 24,
                    lineHeight: 31
                }}
            >
                Teste do pop-up
            </Text>

            <Text
                style={{
                    marginBottom: 24,
                    color:
                        tema.cores.neutras
                            .textoSecundarioClaro,
                    fontFamily: fontFamilies.regular,
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: 'center'
                }}
            >
                Abra e feche várias vezes para
                conferir a fluidez.
            </Text>

            <Pressable
                onPress={modalSucesso.abrirModal}
                accessibilityRole="button"
                accessibilityLabel="Testar pop-up de sucesso"
                style={{
                    width: '100%',
                    minHeight: 56,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 16,
                    borderRadius:
                        tema.radius.buttonAndInput,
                    backgroundColor:
                        tema.cores.marca.secundaria
                }}
            >
                <Text
                    style={{
                        color:
                            tema.cores.neutras
                                .superficieClara,
                        fontFamily: fontFamilies.bold,
                        fontSize: 16,
                        lineHeight: 24
                    }}
                >
                    Testar pop-up
                </Text>
            </Pressable>

            <Modal
                visible={modalMontado}
                transparent
                animationType="none"
                hardwareAccelerated
                statusBarTranslucent
                onShow={quandoModalAparecer}
                onRequestClose={
                    modalSucesso.fecharModal
                }
            >
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 24
                    }}
                >
                    <Animated.View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            opacity: opacidadeFundo,
                            backgroundColor:
                                '#22222266'
                        }}
                    />

                    <Animated.View
                        accessibilityViewIsModal
                        style={{
                            width: '100%',
                            maxWidth: 342,
                            alignItems: 'center',
                            paddingHorizontal: 24,
                            paddingTop: 32,
                            paddingBottom: 24,
                            borderRadius:
                                tema.radius.bottomSheet,
                            opacity: progresso,
                            backgroundColor:
                                tema.cores.neutras
                                    .superficieClara,
                            transform: [
                                {
                                    scale:
                                        escalaCartao
                                },
                                {
                                    translateY:
                                        posicaoCartao
                                }
                            ]
                        }}
                    >
                        <View
                            style={{
                                width: 56,
                                height: 56,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 24,
                                borderRadius: 28,
                                backgroundColor:
                                    tema.cores.icones
                                        .configuracoes
                                        .laranja.caixa
                            }}
                        >
                            <LockIcon
                                size={24}
                                color={
                                    tema.cores.icones
                                        .configuracoes
                                        .laranja.icone
                                }
                                weight="regular"
                            />
                        </View>

                        <Text
                            accessibilityRole="header"
                            style={{
                                marginBottom: 24,
                                color:
                                    tema.cores.neutras
                                        .textoPrincipalClaro,
                                fontFamily:
                                    fontFamilies.bold,
                                fontSize: 22,
                                lineHeight: 29,
                                textAlign: 'center'
                            }}
                        >
                            Dados atualizados com sucesso
                        </Text>

                        <Pressable
                            onPress={
                                modalSucesso.fecharModal
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Fechar mensagem de sucesso"
                            style={{
                                width: '100%',
                                minHeight: 56,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: 16,
                                borderRadius:
                                    tema.radius
                                        .buttonAndInput,
                                backgroundColor:
                                    tema.cores.marca
                                        .secundaria
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        tema.cores.neutras
                                            .superficieClara,
                                    fontFamily:
                                        fontFamilies.bold,
                                    fontSize: 16,
                                    lineHeight: 24
                                }}
                            >
                                OK
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    )
}