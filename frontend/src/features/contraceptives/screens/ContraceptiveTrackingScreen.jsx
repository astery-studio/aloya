import { useMemo, useState } from 'react';
import { ActivityIndicator, SectionList, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FloatingActionButton } from '../../../shared/components/common/FloatingActionButton';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { useTheme } from '../../../shared/hooks/useTheme';
import {
    ContraceptiveUsageCard,
    criarUsos,
    usoConfirmado
} from '../components/ContraceptiveUsageCard';
import { PendingUsesBanner } from '../components/PendingUsesBanner';
import { criarEstilosAcompanhamento } from './ContraceptiveTrackingScreen.styles';

const MENSAGEM_VAZIO =
    'Você ainda não cadastrou nenhum anticoncepcional. Use o botão de adicionar para começar.';
const MENSAGEM_ERRO_CARREGAR =
    'Não foi possível carregar seus anticoncepcionais no momento. Tente novamente.';

function possuiPendente(item) {
    if (item.removido || item.ativo === false) return false;
    return criarUsos(item).some((uso) => !usoConfirmado(uso));
}

function criarSecoes(itens) {
    const secoes = [
        { titulo: 'NÃO USADOS', data: itens.filter(possuiPendente) },
        // Um cartão com duas doses fica em NÃO USADOS até confirmar ambas.
        {
            titulo: 'USADOS',
            data: itens.filter(
                (item) => !item.removido && item.ativo !== false && !possuiPendente(item)
            )
        },
        { titulo: 'REMOVIDOS', data: itens.filter((item) => item.removido || item.ativo === false) }
    ];
    return secoes.filter((secao) => secao.data.length);
}

function SectionLabel({ titulo, primeira, estilosAcompanhamento }) {
    return (
        <View
            style={[
                estilosAcompanhamento.rotuloSecao,
                !primeira && estilosAcompanhamento.rotuloSecaoSeguinte
            ]}
        >
            <View style={estilosAcompanhamento.linhaRotulo} />
            <Text accessibilityRole="header" style={estilosAcompanhamento.textoRotulo}>
                {titulo}
            </Text>
            <View style={estilosAcompanhamento.linhaRotulo} />
        </View>
    );
}

// O modal compartilhado permanece intacto; apenas o ícone desta tela é composto.
function IconeErro() {
    const tema = useTheme();
    return (
        <Svg width={48} height={48} viewBox="0 0 48 48">
            <Rect width="48" height="48" rx="14" fill={tema.escuro ? 'transparent' : '#EEEEEE'} />
            <Circle
                cx="24"
                cy="24"
                r="9"
                fill="none"
                stroke={tema.escuro ? '#EF9A9A' : '#5C5C59'}
                strokeWidth="1.5"
            />
            <Path
                d="M24 19.5v6"
                stroke={tema.escuro ? '#EF9A9A' : '#C85A44'}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <Circle cx="24" cy="30" r="0.8" fill={tema.escuro ? '#EF9A9A' : '#C85A44'} />
        </Svg>
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
    const tema = useTheme();
    const estilosAcompanhamento = useMemo(() => criarEstilosAcompanhamento(tema), [tema]);
    const [usosAtualizados, setUsosAtualizados] = useState({});
    const itens = anticoncepcionais.map((item) => {
        const atualizacao = usosAtualizados[item.id];
        return atualizacao?.origem === item ? { ...item, usosHoje: atualizacao.usos } : item;
    });
    const secoes = criarSecoes(itens);
    const quantidadePendentes = itens.reduce(
        (total, item) =>
            total +
            (item.removido || item.ativo === false
                ? 0
                : criarUsos(item).filter((uso) => !usoConfirmado(uso)).length),
        0
    );

    function atualizarUsos(item, usos) {
        const origem = anticoncepcionais.find((original) => original.id === item.id);
        // Uma resposta canônica posterior da API não pode ser sobrescrita por um cartão desmontado.
        if (origem !== item && usosAtualizados[item.id]?.origem !== origem) return;
        setUsosAtualizados((atuais) => ({ ...atuais, [item.id]: { origem, usos } }));
    }

    return (
        <SafeAreaView
            edges={['left', 'right', 'bottom']}
            style={estilosAcompanhamento.tela}
            testID="anticoncepcionais-area-segura"
        >
            <Header titulo="Anticoncepcionais" variante="comVoltar" onVoltar={aoVoltar} />

            {carregando ? (
                <View style={estilosAcompanhamento.estadoCentral}>
                    <ActivityIndicator size="large" color={tema.escuro ? '#F08A75' : '#C85A44'} />
                    <Text style={estilosAcompanhamento.mensagemEstado}>
                        Carregando anticoncepcionais...
                    </Text>
                </View>
            ) : !itens.length ? (
                <View style={estilosAcompanhamento.estadoVazio}>
                    <Text style={estilosAcompanhamento.tituloVazio}>Nenhum anticoncepcional</Text>
                    <Text style={estilosAcompanhamento.mensagemVazio}>{MENSAGEM_VAZIO}</Text>
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
                        renderSectionHeader={({ section }) => (
                            <SectionLabel
                                estilosAcompanhamento={estilosAcompanhamento}
                                titulo={section.titulo}
                                primeira={section === secoes[0]}
                            />
                        )}
                        renderItem={({ item }) => (
                            <ContraceptiveUsageCard
                                anticoncepcional={item}
                                aoEditar={aoEditar}
                                aoRemover={aoRemover}
                                aoAlternarUso={aoAlternarUso}
                                aoAtualizarUsos={atualizarUsos}
                            />
                        )}
                        ItemSeparatorComponent={() => (
                            <View style={estilosAcompanhamento.espacoCartao} />
                        )}
                        contentContainerStyle={estilosAcompanhamento.lista}
                        stickySectionHeadersEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            {!carregando && !erro && typeof aoCadastrarNovo === 'function' ? (
                <FloatingActionButton
                    aoPressionar={aoCadastrarNovo}
                    rotuloAcessibilidade="Cadastrar novo anticoncepcional"
                    considerarAreaSeguraInferior={false}
                    testID="contraceptive-tracking-add-fab"
                />
            ) : null}

            <SimpleModal
                erroInterno
                visivel={Boolean(erro)}
                aoFechar={aoVoltar}
                icone={IconeErro}
                corIcone="#5C5C59"
                fundoIcone="transparent"
                titulo="Algo deu errado"
                mensagem={MENSAGEM_ERRO_CARREGAR.replace('. Tente', '.\nTente')}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: aoTentarNovamente
                }}
                acaoSecundaria={{ texto: 'Voltar', variante: 'branco', aoPressionar: aoVoltar }}
            />

            <SimpleModal
                erroInterno
                visivel={Boolean(erroUso)}
                aoFechar={aoDispensarErroUso}
                icone={IconeErro}
                corIcone="#5C5C59"
                fundoIcone="transparent"
                titulo="Algo deu errado"
                mensagem={
                    'Não foi possível marcar o uso do anticoncepcional no momento.\nTente novamente.'
                }
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: aoDispensarErroUso
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: aoDispensarErroUso
                }}
            />
        </SafeAreaView>
    );
}

export { ContraceptiveTrackingScreen, MENSAGEM_ERRO_CARREGAR, MENSAGEM_VAZIO, criarSecoes };
