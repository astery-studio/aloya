// Apresenta os estados visualmente fiéis do histórico dentro do layout principal do app.
import { useMemo } from 'react';
import { ActivityIndicator, Text, useWindowDimensions, View } from 'react-native';
import { FunnelSimpleIcon } from 'phosphor-react-native/src/icons/FunnelSimple';
import { GearSixIcon } from 'phosphor-react-native/src/icons/GearSix';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import { EmptyState } from '../../../shared/components/feedback/EmptyState/EmptyState';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import { DiaryOverviewCard } from '../components/DiaryOverviewCard/DiaryOverviewCard';
import { DiaryTimeline } from '../components/DiaryTimeline/DiaryTimeline';
import { criarEstilos } from './DiaryScreen.styles';

// Mantém o conjunto trilho + card com a largura de 350 px do protótipo em celulares estreitos.
function calcularMargemHorizontalTimeline(larguraTela) {
    if (!Number.isFinite(larguraTela) || larguraTela <= 0) return 20;
    return Math.max(5, Math.min(20, (larguraTela - 350) / 2));
}

// Renderiza o separador acessível que introduz a linha do tempo.
function DivisorTimeline({ estilos }) {
    return (
        <View
            accessible
            accessibilityRole="header"
            accessibilityLabel="Linha do tempo"
            style={estilos.divisor}
        >
            <View style={estilos.linhaDivisor} />
            <Text style={estilos.textoDivisor}>LINHA DO TEMPO</Text>
            <View style={estilos.linhaDivisor} />
        </View>
    );
}

// Recebe estado e callbacks do fluxo e retorna loading, erro, vazio ou histórico preenchido.
function DiaryScreen({
    resumo,
    registros = [],
    carregando = false,
    atualizando = false,
    carregandoMais = false,
    erro,
    erroCarregarMais,
    temMais = false,
    aoTentarNovamente,
    aoCarregarMais,
    aoTentarCarregarMais,
    aoCriar,
    aoAbrirRegistro,
    aoEditarRegistro,
    aoExcluirRegistro,
    registroEmExclusaoId,
    aoAbrirFiltros,
    aoGerenciarCategorias,
    onSelecionarAba
}) {
    const tema = useTheme();
    const { width: larguraTela } = useWindowDimensions();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const margemHorizontalTimeline = calcularMargemHorizontalTimeline(larguraTela);
    const itens = Array.isArray(registros) ? registros : [];
    const possuiErro = typeof erro === 'string' && erro.trim();
    const vazio = !carregando && !possuiErro && itens.length === 0;
    const possuiAcoesHeader =
        typeof aoAbrirFiltros === 'function' || typeof aoGerenciarCategorias === 'function';

    const acoesHeader = possuiAcoesHeader ? (
        <>
            {typeof aoAbrirFiltros === 'function' ? (
                <IconButton
                    icone={FunnelSimpleIcon}
                    aoPressionar={aoAbrirFiltros}
                    rotuloAcessibilidade="Filtrar histórico do Diário"
                    variante="selecionado"
                    corIcone={tema.cores.marca.secundaria}
                />
            ) : null}
            {typeof aoGerenciarCategorias === 'function' ? (
                <IconButton
                    icone={GearSixIcon}
                    aoPressionar={aoGerenciarCategorias}
                    rotuloAcessibilidade="Gerenciar categorias do Diário"
                    variante="selecionado"
                    corIcone={tema.cores.marca.primaria}
                />
            ) : null}
        </>
    ) : null;

    const introducao = (
        <View style={estilos.introducao}>
            <Text style={estilos.descricao}>
                Conheça melhor seu corpo! Registre sintomas, emoções e descobertas ao longo do seu
                ciclo.
            </Text>
            {atualizando ? (
                <View accessibilityLiveRegion="polite" style={estilos.atualizando}>
                    <ActivityIndicator size="small" color={tema.cores.interface.destaque} />
                    <Text style={estilos.textoAtualizando}>Atualizando Diário...</Text>
                </View>
            ) : null}
        </View>
    );

    let conteudo;
    if (carregando) {
        conteudo = (
            <View style={estilos.conteudoEstatico}>
                {introducao}
                <View
                    testID="diary-loading"
                    accessibilityLiveRegion="polite"
                    style={estilos.estadoCentralizado}
                >
                    <ActivityIndicator color={tema.cores.interface.destaque} />
                    <Text style={estilos.mensagemEstado}>Carregando histórico do Diário...</Text>
                </View>
            </View>
        );
    } else if (possuiErro) {
        conteudo = (
            <View style={estilos.conteudoEstatico}>
                {introducao}
                <View style={estilos.estadoCentralizado}>
                    <EmptyState
                        variante="erro"
                        titulo="Ocorreu um erro"
                        mensagem="Não foi possível carregar seu histórico do Diário. Tente novamente."
                        acao={
                            <ButtonScreen
                                texto="Tentar Novamente"
                                variante="preto"
                                aoPressionar={aoTentarNovamente}
                            />
                        }
                    />
                </View>
            </View>
        );
    } else if (vazio) {
        conteudo = (
            <View style={estilos.conteudoEstatico}>
                {introducao}
                <View style={estilos.estadoCentralizado}>
                    <EmptyState
                        titulo="Nenhum registro visível"
                        mensagem={
                            'Você ainda pode não ter registros ou as categorias usadas neles podem estar desativadas.\nAtive-as em "Gerenciar categorias" ou toque em "Adicionar novo registro" para começar.'
                        }
                        acao={
                            <ButtonScreen
                                texto="Adicionar novo registro"
                                variante="laranja"
                                aoPressionar={aoCriar}
                            />
                        }
                    />
                </View>
            </View>
        );
    } else {
        const cabecalhoLista = (
            <View style={estilos.cabecalhoLista}>
                {introducao}
                {resumo ? <DiaryOverviewCard {...resumo} /> : null}
                <DivisorTimeline estilos={estilos} />
            </View>
        );
        conteudo = (
            <DiaryTimeline
                registros={itens}
                aoAbrir={aoAbrirRegistro}
                aoEditar={aoEditarRegistro}
                aoExcluir={aoExcluirRegistro}
                acaoEmAndamentoId={registroEmExclusaoId}
                carregandoMais={carregandoMais}
                erroCarregarMais={Boolean(erroCarregarMais)}
                temMais={temMais}
                aoCarregarMais={aoCarregarMais}
                aoTentarCarregarMais={aoTentarCarregarMais}
                ListHeaderComponent={cabecalhoLista}
                contentContainerStyle={[
                    estilos.lista,
                    { paddingHorizontal: margemHorizontalTimeline }
                ]}
            />
        );
    }

    return (
        <MainLayout
            titulo="Diário"
            varianteHeader="diario"
            abaAtiva="diario"
            onSelecionarAba={onSelecionarAba}
            acoesHeader={acoesHeader}
        >
            <View testID="diary-main-container" style={estilos.tela}>
                {conteudo}
                {!carregando && !possuiErro && !vazio ? (
                    <View style={estilos.acaoFixa}>
                        <ButtonScreen texto="Adicionar novo registro" aoPressionar={aoCriar} />
                    </View>
                ) : null}
            </View>
        </MainLayout>
    );
}

export { calcularMargemHorizontalTimeline, DiaryScreen, DivisorTimeline };
