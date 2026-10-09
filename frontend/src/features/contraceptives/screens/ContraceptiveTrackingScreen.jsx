import { useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, Text, View } from 'react-native';
import { ArrowLeftIcon } from '../../../shared/components/icons/AppIcons';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { ContraceptiveUsageCard, criarUsos, usoConfirmado } from '../components/ContraceptiveUsageCard';
import { PendingUsesBanner } from '../components/PendingUsesBanner';
import { estilosAcompanhamento } from './ContraceptiveTrackingScreen.styles';

const MENSAGEM_VAZIO = 'Você ainda não cadastrou nenhum anticoncepcional. Toque em "Cadastrar novo anticoncepcional" para começar.';
const MENSAGEM_ERRO_CARREGAR = 'Não foi possível carregar seus anticoncepcionais no momento. Tente novamente.';

function possuiPendente(item) {
    if (item.removido || item.ativo === false) return false;
    return criarUsos(item).some((uso) => !usoConfirmado(uso));
}

function criarSecoes(itens) {
    const secoes = [
        { titulo: 'NÃO USADOS', data: itens.filter(possuiPendente) },
        // Um cartão com duas doses fica em NÃO USADOS até confirmar ambas.
        { titulo: 'USADOS', data: itens.filter((item) => !item.removido && item.ativo !== false && !possuiPendente(item)) },
        { titulo: 'REMOVIDOS', data: itens.filter((item) => item.removido || item.ativo === false) }
    ];
    return secoes.filter((secao) => secao.data.length);
}

function SectionLabel({ titulo, primeira }) {
    return (
        <View style={[estilosAcompanhamento.rotuloSecao, !primeira && estilosAcompanhamento.rotuloSecaoSeguinte]}>
            <View style={estilosAcompanhamento.linhaRotulo} />
            <Text accessibilityRole="header" style={estilosAcompanhamento.textoRotulo}>{titulo}</Text>
            <View style={estilosAcompanhamento.linhaRotulo} />
        </View>
    );
}

// O modal compartilhado permanece intacto; apenas o ícone desta tela é composto.
function IconeErro() {
    return (
        <Svg width={48} height={48} viewBox="0 0 48 48">
            <Rect width="48" height="48" rx="14" fill="#EEEEEE" />
            <Circle cx="24" cy="24" r="9" fill="none" stroke="#5C5C59" strokeWidth="1.5" />
            <Path d="M24 19.5v6" stroke="#C85A44" strokeWidth="2" strokeLinecap="round" />
            <Circle cx="24" cy="30" r="0.8" fill="#C85A44" />
        </Svg>
    );
}

function AcaoCadastro({ aoPressionar }) {
    const [largura, setLargura] = useState(350.01);
    // O texto de 18px do botão existente aparece com os 17px do protótipo.
    // Em telas estreitas, o mesmo botão continua inteiro, sem cortar o rótulo.
    const escala = Math.min(17 / 18, (largura / 350.01) * (17 / 18));
    const larguraBase = largura / escala;
    const alturaBase = 56 / escala;

    return (
        <View
            style={estilosAcompanhamento.areaAcaoCadastro}
            onLayout={({ nativeEvent }) => {
                if (nativeEvent.layout.width > 0) setLargura(nativeEvent.layout.width);
            }}
        >
            <ButtonScreen
                texto="Cadastrar novo anticoncepcional"
                variante="laranja"
                aoPressionar={aoPressionar}
                estilo={{
                    position: 'absolute',
                    width: larguraBase,
                    height: alturaBase,
                    left: (largura - larguraBase) / 2,
                    top: (56 - alturaBase) / 2,
                    borderRadius: 16 / escala,
                    transform: [{ scale: escala }]
                }}
            />
        </View>
    );
}

function ContraceptiveTrackingScreen({
    anticoncepcionais = [],
    carregando = false,
    erro = null,
    erroUso = null,
    aoVoltar,
    aoCadastrarNovo,
    aoTentarNovamente,
    aoDispensarErroUso,
    aoEditar,
    aoRemover,
    aoAlternarUso
}) {
    const [usosAtualizados, setUsosAtualizados] = useState({});
    const [larguraCabecalho, setLarguraCabecalho] = useState(393.33);
    const tamanhoTitulo = Math.min(26, Math.max(18, (larguraCabecalho - 131.32) * 26 / 244));
    const itens = anticoncepcionais.map((item) => {
        const atualizacao = usosAtualizados[item.id];
        return atualizacao?.origem === item ? { ...item, usosHoje: atualizacao.usos } : item;
    });
    const secoes = criarSecoes(itens);
    const quantidadePendentes = itens.reduce((total, item) => total
        + (item.removido || item.ativo === false ? 0 : criarUsos(item).filter((uso) => !usoConfirmado(uso)).length), 0);

    function atualizarUsos(item, usos) {
        const origem = anticoncepcionais.find((original) => original.id === item.id);
        // Uma resposta canônica posterior da API não pode ser sobrescrita por um cartão desmontado.
        if (origem !== item && usosAtualizados[item.id]?.origem !== origem) return;
        setUsosAtualizados((atuais) => ({ ...atuais, [item.id]: { origem, usos } }));
    }

    return (
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={estilosAcompanhamento.tela} testID="anticoncepcionais-area-segura">
            <View style={estilosAcompanhamento.cabecalho} onLayout={({ nativeEvent }) => {
                if (nativeEvent.layout.width > 0) setLarguraCabecalho(nativeEvent.layout.width);
            }}>
                <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={aoVoltar} hitSlop={10} style={estilosAcompanhamento.botaoVoltar}>
                    <ArrowLeftIcon size={24} color="#5C5C59" />
                </Pressable>
                <Text accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[estilosAcompanhamento.titulo, { fontSize: tamanhoTitulo }]}>Anticoncepcionais</Text>
                <View style={estilosAcompanhamento.espacoCabecalho} />
            </View>

            {carregando ? (
                <View style={estilosAcompanhamento.estadoCentral}>
                    <ActivityIndicator size="large" color="#C85A44" />
                    <Text style={estilosAcompanhamento.mensagemEstado}>Carregando anticoncepcionais...</Text>
                </View>
            ) : !itens.length ? (
                <View style={estilosAcompanhamento.estadoVazio}>
                    <Text style={estilosAcompanhamento.tituloVazio}>Nenhum anticoncepcional</Text>
                    <Text style={estilosAcompanhamento.mensagemVazio}>
                        {'Você ainda não cadastrou nenhum anticoncepcional. Toque em "'}
                        <Text style={estilosAcompanhamento.destaqueVazio}>Cadastrar novo anticoncepcional</Text>
                        {'" para começar.'}
                    </Text>
                </View>
            ) : (
                <View style={estilosAcompanhamento.corpo}>
                    {quantidadePendentes ? (
                        <View style={estilosAcompanhamento.areaBanner}>
                            <PendingUsesBanner quantidade={quantidadePendentes} />
                        </View>
                    ) : null}
                    <SectionList
                        style={estilosAcompanhamento.rolagem}
                        sections={secoes}
                        keyExtractor={(item) => String(item.id)}
                        renderSectionHeader={({ section }) => <SectionLabel titulo={section.titulo} primeira={section === secoes[0]} />}
                        renderItem={({ item }) => (
                            <ContraceptiveUsageCard
                                anticoncepcional={item}
                                aoEditar={aoEditar}
                                aoRemover={aoRemover}
                                aoAlternarUso={aoAlternarUso}
                                aoAtualizarUsos={atualizarUsos}
                            />
                        )}
                        ItemSeparatorComponent={() => <View style={estilosAcompanhamento.espacoCartao} />}
                        contentContainerStyle={estilosAcompanhamento.lista}
                        stickySectionHeadersEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            {!carregando ? (
                <View style={estilosAcompanhamento.rodape}>
                    <View style={estilosAcompanhamento.conteudoRodape}>
                        <AcaoCadastro aoPressionar={aoCadastrarNovo} />
                    </View>
                </View>
            ) : null}

            <SimpleModal
                visivel={Boolean(erro)}
                aoFechar={aoVoltar}
                icone={IconeErro}
                corIcone="#5C5C59"
                fundoIcone="transparent"
                titulo="Algo deu errado"
                mensagem={MENSAGEM_ERRO_CARREGAR.replace('. Tente', '.\nTente')}
                acaoPrincipal={{ texto: 'Tentar novamente', variante: 'preto', aoPressionar: aoTentarNovamente }}
                acaoSecundaria={{ texto: 'Voltar', variante: 'branco', aoPressionar: aoVoltar }}
            />

            <SimpleModal
                visivel={Boolean(erroUso)}
                aoFechar={aoDispensarErroUso}
                icone={IconeErro}
                corIcone="#5C5C59"
                fundoIcone="transparent"
                titulo="Algo deu errado"
                mensagem={'Não foi possível marcar o uso do anticoncepcional no momento.\nTente novamente.'}
                acaoPrincipal={{ texto: 'Tentar novamente', variante: 'preto', aoPressionar: aoDispensarErroUso }}
                acaoSecundaria={{ texto: 'Voltar', variante: 'branco', aoPressionar: aoDispensarErroUso }}
            />
        </SafeAreaView>
    );
}

export {
    ContraceptiveTrackingScreen,
    MENSAGEM_ERRO_CARREGAR,
    MENSAGEM_VAZIO,
    criarSecoes
};
