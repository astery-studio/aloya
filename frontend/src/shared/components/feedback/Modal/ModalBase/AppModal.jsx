/**
 * Estrutura base dos modais, responsável por apresentação, variantes e conteúdo acionável.
 */
import { useEffect, useRef } from 'react';
import {
    AccessibilityInfo,
    findNodeHandle,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores } from '../../../../theme';
import { estilos } from './AppModal.styles';

export default function AppModal({
    variante = 'simples',
    visivel,
    aoFechar,
    icone: Icone,
    corIcone,
    fundoIcone,
    estiloIcone,
    titulo,
    mensagem,
    destaque,
    aoOcultar,
    children
}) {
    const referenciaTitulo = useRef(null);
    const visivelAnterior = useRef(visivel);

    useEffect(() => {
        if (Platform.OS !== 'ios' && visivelAnterior.current && !visivel) {
            aoOcultar?.();
        }
        visivelAnterior.current = visivel;
    }, [aoOcultar, visivel]);

    if (!['simples', 'alerta', 'acao'].includes(variante)) {
        throw new Error(`Variante de AppModal inválida: ${variante}`);
    }

    // Mantém o Modal montado enquanto o iOS conclui o fechamento e emite onDismiss.
    // Desmontá-lo aqui interrompe as ações que aguardam aoOcultar, como salvar.
    const alerta = variante === 'alerta';
    const acao = variante === 'acao';
    const corDoIcone = corIcone || (acao ? cores.feedback.erro : cores.marca.primaria);

    function focarTitulo() {
        const identificador = findNodeHandle(referenciaTitulo.current);
        if (identificador) AccessibilityInfo.setAccessibilityFocus(identificador);
    }

    return (
        <Modal
            visible={visivel}
            transparent
            animationType="fade"
            onDismiss={aoOcultar}
            onRequestClose={aoFechar}
            onShow={focarTitulo}
        >
            <SafeAreaView style={estilos.fundo}>
                <KeyboardAvoidingView
                    style={estilos.flexivel}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        testID="app-modal-scroll"
                        bounces={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={estilos.rolagem}
                    >
                        <View
                            accessibilityViewIsModal
                            style={[
                                estilos.caixa,
                                alerta
                                    ? estilos.caixaAlerta
                                    : acao
                                      ? estilos.caixaAcao
                                      : estilos.caixaSimples
                            ]}
                        >
                            {alerta && (
                                <View style={estilos.cabecalhoAlerta}>
                                    {Icone && (
                                        <View style={estilos.iconeAlerta}>
                                            <Icone
                                                size={26}
                                                color={cores.neutras.superficieClara}
                                            />
                                        </View>
                                    )}
                                </View>
                            )}
                            <View
                                style={[
                                    estilos.conteudo,
                                    alerta
                                        ? estilos.conteudoAlerta
                                        : acao
                                          ? estilos.conteudoAcao
                                          : estilos.conteudoSimples
                                ]}
                            >
                                {!alerta && Icone && (
                                    <View
                                        style={[
                                            estilos.areaIcone,
                                            estiloIcone,
                                            acao && estilos.areaIconeAcao,
                                            fundoIcone && { backgroundColor: fundoIcone }
                                        ]}
                                    >
                                        <Icone size={22} color={corDoIcone} />
                                    </View>
                                )}
                                <View style={estilos.textos}>
                                    <Text
                                        ref={referenciaTitulo}
                                        accessible
                                        accessibilityRole="header"
                                        style={estilos.titulo}
                                    >
                                        {titulo}
                                    </Text>
                                    {mensagem ? (
                                        <Text
                                            style={[
                                                estilos.mensagem,
                                                alerta && estilos.mensagemAlerta
                                            ]}
                                        >
                                            {mensagem}
                                        </Text>
                                    ) : null}
                                    {destaque ? (
                                        <Text style={estilos.destaque}>{destaque}</Text>
                                    ) : null}
                                </View>
                                {children ? <View style={estilos.acoes}>{children}</View> : null}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}
