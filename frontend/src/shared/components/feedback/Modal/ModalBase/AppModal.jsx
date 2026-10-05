/**
 * Estrutura base dos modais, responsável por apresentação, variantes e conteúdo acionável.
 */
import { Modal, Text, View } from 'react-native';
import { cores } from '../../../../theme';
import { estilos } from './AppModal.styles';

export default function AppModal({
    variante = 'simples', visivel, aoFechar, icone: Icone,
    corIcone, fundoIcone, titulo, mensagem, destaque, children
}) {
    if (!['simples', 'alerta', 'acao'].includes(variante)) {
        throw new Error(`Variante de AppModal inválida: ${variante}`);
    }

    if (!visivel) {
        return null;
    }

    const alerta = variante === 'alerta';
    const acao = variante === 'acao';
    const corDoIcone = corIcone || (acao ? cores.feedback.erro : cores.marca.primaria);

    return (
        <Modal
            visible={visivel}
            transparent
            animationType="fade"
            onRequestClose={aoFechar}
        >
            <View style={estilos.fundo}>
                <View
                    accessibilityViewIsModal
                    style={[estilos.caixa, alerta ? estilos.caixaAlerta :
                        acao ? estilos.caixaAcao : estilos.caixaSimples]}
                >
                    {alerta && (
                        <View style={estilos.cabecalhoAlerta}>
                            {Icone && (
                                <View style={estilos.iconeAlerta}>
                                    <Icone size={26} color={cores.neutras.superficieClara} />
                                </View>
                            )}
                        </View>
                    )}
                    <View style={[estilos.conteudo, alerta ? estilos.conteudoAlerta :
                        acao ? estilos.conteudoAcao : estilos.conteudoSimples]}>
                        {!alerta && Icone && (
                            <View style={[estilos.areaIcone, acao && estilos.areaIconeAcao,
                                fundoIcone && { backgroundColor: fundoIcone }]}>
                                <Icone size={22} color={corDoIcone} />
                            </View>
                        )}
                        <View style={estilos.textos}>
                            <Text accessibilityRole="header" style={estilos.titulo}>
                                {titulo}
                            </Text>
                            {mensagem ? (
                                <Text style={[estilos.mensagem,
                                    alerta && estilos.mensagemAlerta
                                ]}>{mensagem}</Text>
                            ) : null}
                            {destaque ? (
                                <Text style={estilos.destaque}>{destaque}</Text>
                            ) : null}
                        </View>
                        {children ? (
                            <View style={estilos.acoes}>{children}</View>
                        ) : null}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
