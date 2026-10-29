/**
 * Estrutura base dos modais, responsável por apresentação,
 * variantes e conteúdo acionável.
 */
import { useMemo } from 'react';
import { Modal, Text, View } from 'react-native';

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
    titulo,
    mensagem,
    destaque,
    children
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    if (!VARIANTES_MODAL.has(variante)) {
        throw new Error(`Variante de AppModal inválida: ${variante}`);
    }

    if (!visivel) {
        return null;
    }

    const alerta = variante === 'alerta';

    const acao = variante === 'acao';

    const corDoIcone = corIcone || (acao ? tema.cores.feedback.erro : tema.cores.marca.primaria);

    return (
        <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
            <View testID="app-modal-fundo" style={estilos.fundo}>
                <View
                    testID="app-modal-caixa"
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
                    {alerta ? (
                        <View style={estilos.cabecalhoAlerta}>
                            {Icone ? (
                                <View style={estilos.iconeAlerta}>
                                    <Icone size={26} color={tema.cores.neutras.superficieClara} />
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
                                    acao && estilos.areaIconeAcao,
                                    fundoIcone
                                        ? {
                                              backgroundColor: fundoIcone
                                          }
                                        : null
                                ]}
                            >
                                <Icone size={22} color={corDoIcone} />
                            </View>
                        ) : null}

                        <View style={estilos.textos}>
                            <Text accessibilityRole="header" style={estilos.titulo}>
                                {titulo}
                            </Text>

                            {mensagem ? (
                                <Text style={[estilos.mensagem, alerta && estilos.mensagemAlerta]}>
                                    {mensagem}
                                </Text>
                            ) : null}

                            {destaque ? <Text style={estilos.destaque}>{destaque}</Text> : null}
                        </View>

                        {children ? <View style={estilos.acoes}>{children}</View> : null}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
