import { ActivityIndicator, Pressable, SectionList, Text, View } from 'react-native';
import { ArrowLeftIcon, WarningCircleIcon } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { ContraceptiveUsageCard } from '../components/ContraceptiveUsageCard';
import { PendingUsesBanner } from '../components/PendingUsesBanner';
import { estilosAcompanhamento } from './ContraceptiveTrackingScreen.styles';

const MENSAGEM_VAZIO = 'Você ainda não cadastrou nenhum anticoncepcional. Toque em "Cadastrar novo anticoncepcional" para começar.';
const MENSAGEM_ERRO_CARREGAR = 'Não foi possível carregar seus anticoncepcionais no momento. Tente novamente.';

function possuiPendente(item) {
    if (item.removido || item.ativo === false) return false;
    const usos = item.usosHoje ?? [];
    if (usos.length) return usos.some((uso) => uso.status !== 'confirmado');
    return Boolean(item.programacao?.horarios?.length);
}

function possuiConfirmado(item) {
    if (item.removido || item.ativo === false) return false;
    return (item.usosHoje ?? []).some((uso) => uso.status === 'confirmado') || !possuiPendente(item);
}

function criarSecoes(itens) {
    const secoes = [
        { titulo: 'NÃO USADOS', data: itens.filter(possuiPendente) },
        { titulo: 'USADOS', data: itens.filter(possuiConfirmado) },
        { titulo: 'REMOVIDOS', data: itens.filter((item) => item.removido || item.ativo === false) }
    ];
    return secoes.filter((secao) => secao.data.length);
}

function SectionLabel({ titulo }) {
    return (
        <View style={estilosAcompanhamento.rotuloSecao}>
            <View style={estilosAcompanhamento.linhaRotulo} />
            <Text style={estilosAcompanhamento.textoRotulo}>{titulo}</Text>
            <View style={estilosAcompanhamento.linhaRotulo} />
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
    const secoes = criarSecoes(anticoncepcionais);
    const quantidadePendentes = anticoncepcionais.reduce((total, item) => total
        + (item.usosHoje ?? item.programacao?.horarios ?? []).filter((uso) => typeof uso === 'string' || uso.status !== 'confirmado').length, 0);

    return (
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={estilosAcompanhamento.tela}>
            <View style={estilosAcompanhamento.cabecalho}>
                <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={aoVoltar} hitSlop={10} style={estilosAcompanhamento.botaoVoltar}>
                    <ArrowLeftIcon size={24} color="#5C5C59" />
                </Pressable>
                <Text accessibilityRole="header" style={estilosAcompanhamento.titulo}>Anticoncepcionais</Text>
                <View style={estilosAcompanhamento.espacoCabecalho} />
            </View>

            {carregando ? (
                <View style={estilosAcompanhamento.estadoCentral}>
                    <ActivityIndicator size="large" color="#C85A44" />
                    <Text style={estilosAcompanhamento.mensagemEstado}>Carregando anticoncepcionais...</Text>
                </View>
            ) : (
                <SectionList
                    sections={secoes}
                    keyExtractor={(item) => String(item.id)}
                    renderSectionHeader={({ section }) => <SectionLabel titulo={section.titulo} />}
                    renderItem={({ item }) => (
                        <ContraceptiveUsageCard
                            anticoncepcional={item}
                            aoEditar={aoEditar}
                            aoRemover={aoRemover}
                            aoAlternarUso={aoAlternarUso}
                        />
                    )}
                    ItemSeparatorComponent={() => <View style={estilosAcompanhamento.espacoCartao} />}
                    SectionSeparatorComponent={() => <View style={estilosAcompanhamento.espacoSecao} />}
                    ListHeaderComponent={quantidadePendentes ? <PendingUsesBanner quantidade={quantidadePendentes} /> : null}
                    ListEmptyComponent={(
                        <View style={estilosAcompanhamento.estadoVazio}>
                            <Text style={estilosAcompanhamento.tituloVazio}>Nenhum anticoncepcional</Text>
                            <Text style={estilosAcompanhamento.mensagemVazio}>{MENSAGEM_VAZIO}</Text>
                        </View>
                    )}
                    contentContainerStyle={estilosAcompanhamento.lista}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {!carregando ? (
                <View style={estilosAcompanhamento.rodape}>
                    <ButtonScreen texto="Cadastrar novo anticoncepcional" variante="laranja" aoPressionar={aoCadastrarNovo} />
                </View>
            ) : null}

            <SimpleModal
                visivel={Boolean(erro)}
                aoFechar={aoVoltar}
                icone={WarningCircleIcon}
                corIcone="#5C5C59"
                fundoIcone="#EEEEEE"
                titulo="Algo deu errado"
                mensagem={MENSAGEM_ERRO_CARREGAR}
                acaoPrincipal={{ texto: 'Tentar novamente', variante: 'preto', aoPressionar: aoTentarNovamente }}
                acaoSecundaria={{ texto: 'Voltar', variante: 'branco', aoPressionar: aoVoltar }}
            />

            <SimpleModal
                visivel={Boolean(erroUso)}
                aoFechar={aoDispensarErroUso}
                icone={WarningCircleIcon}
                corIcone="#5C5C59"
                fundoIcone="#EEEEEE"
                titulo="Algo deu errado"
                mensagem="Não foi possível marcar o uso do anticoncepcional no momento. Tente novamente."
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
