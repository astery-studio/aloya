/**
 * Estrutura base dos modais, responsável por apresentação, variantes e conteúdo acionável.
 */
import { useEffect, useMemo, useRef } from 'react';
import {
    AccessibilityInfo,
    findNodeHandle,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../hooks/useTheme';
import { criarEstilos } from './AppModal.styles';

const VARIANTES_MODAL = new Set(['simples', 'alerta', 'acao']);

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
    children,
    estilo,
    estiloCabecalho,
    estiloIconeCabecalho,
    corIconeCabecalho,
    rolagemExternaHabilitada = true,
    fecharAoTocarFora = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const referenciaTitulo = useRef(null);
    const visivelAnterior = useRef(visivel);

    useEffect(() => {
        if (Platform.OS !== 'ios' && visivelAnterior.current && !visivel) {
            aoOcultar?.();
        }
        visivelAnterior.current = visivel;
    }, [aoOcultar, visivel]);

    if (!VARIANTES_MODAL.has(variante)) {
        throw new Error(`Variante de AppModal inválida: ${variante}`);
    }

    // Mantém o Modal montado enquanto o iOS conclui o fechamento e emite onDismiss.
    // Desmontá-lo aqui interrompe as ações que aguardam aoOcultar, como salvar.
    const alerta = variante === 'alerta';
    const acao = variante === 'acao';
    const corDoIcone = corIcone || (acao ? tema.cores.feedback.erro : tema.cores.marca.primaria);

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
            <SafeAreaView testID="app-modal-fundo" style={estilos.fundo}>
                <Pressable
                    testID="app-modal-fundo-interativo"
                    accessibilityRole={fecharAoTocarFora ? 'button' : undefined}
                    accessibilityLabel={fecharAoTocarFora ? 'Fechar modal' : undefined}
                    disabled={!fecharAoTocarFora}
                    onPress={fecharAoTocarFora ? aoFechar : undefined}
                    style={estilos.fundoInterativo}
                />

                <KeyboardAvoidingView
                    style={estilos.flexivel}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        testID="app-modal-scroll"
                        scrollEnabled={rolagemExternaHabilitada}
                        bounces={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={estilos.rolagem}
                    >
                        <View
                            testID="app-modal-caixa"
                            accessibilityViewIsModal
                            style={[
                                estilos.caixa,
                                alerta
                                    ? estilos.caixaAlerta
                                    : acao
                                      ? estilos.caixaAcao
                                      : estilos.caixaSimples,
                                estilo
                            ]}
                        >
                            {alerta ? (
                                <View style={[estilos.cabecalhoAlerta, estiloCabecalho]}>
                                    {Icone ? (
                                        <View style={[estilos.iconeAlerta, estiloIconeCabecalho]}>
                                            <Icone
                                                size={26}
                                                color={
                                                    corIconeCabecalho ??
                                                    tema.cores.neutras.superficieClara
                                                }
                                            />
                                        </View>
                                    ) : null}
                                </View>
                            ) : null}
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
                                {!alerta && Icone ? (
                                    <View
                                        style={[
                                            estilos.areaIcone,
                                            estiloIcone,
                                            acao && estilos.areaIconeAcao,
                                            fundoIcone ? { backgroundColor: fundoIcone } : null
                                        ]}
                                    >
                                        <Icone size={22} color={corDoIcone} />
                                    </View>
                                ) : null}
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
