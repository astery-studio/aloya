// Apresenta os estados visualmente fiéis do histórico dentro do layout principal do app.
import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { FunnelIcon } from 'phosphor-react-native/src/icons/Funnel';
import { GearSixIcon } from 'phosphor-react-native/src/icons/GearSix';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import {
    DiaryHistoryHeader,
    DiaryTimelineDivider as DivisorTimeline
} from '../components/DiaryHistoryHeader/DiaryHistoryHeader';
import { DiaryHistoryStateView } from '../components/DiaryHistoryStateView/DiaryHistoryStateView';
import { DiaryTimeline } from '../components/DiaryTimeline/DiaryTimeline';
import { possuiFiltrosDiario } from '../utils/diaryFilters';
import { criarEstilos } from './DiaryScreen.styles';

// Mantém o conjunto trilho + card com a largura de 350 px do protótipo em celulares estreitos.
function calcularMargemHorizontalTimeline(larguraTela) {
    if (!Number.isFinite(larguraTela) || larguraTela <= 0) return 20;
    return Math.max(5, Math.min(20, (larguraTela - 350) / 2));
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
    filtros,
    rotulosCategoriasFiltro,
    aoAbrirFiltros,
    aoRemoverFiltro,
    aoLimparFiltros,
    aoGerenciarCategorias,
    onSelecionarAba
}) {
    const tema = useTheme();
    const { width: larguraTela } = useWindowDimensions();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const margemHorizontalTimeline = calcularMargemHorizontalTimeline(larguraTela);
    const itens = Array.isArray(registros) ? registros : [];
    const possuiErro = typeof erro === 'string' && erro.trim();
    const filtrosAtivos = possuiFiltrosDiario(filtros);
    const vazio = !carregando && !possuiErro && itens.length === 0;
    const possuiAcoesHeader =
        typeof aoAbrirFiltros === 'function' || typeof aoGerenciarCategorias === 'function';

    const acoesHeader = possuiAcoesHeader ? (
        <>
            {typeof aoAbrirFiltros === 'function' ? (
                <IconButton
                    icone={FunnelIcon}
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

    function criarCabecalho(mostrarConteudo = true, mostrarDivisor = true) {
        return (
            <DiaryHistoryHeader
                atualizando={atualizando}
                resumo={resumo}
                filtrosAtivos={filtrosAtivos}
                filtros={filtros}
                rotulosCategorias={rotulosCategoriasFiltro}
                quantidadeResultados={itens.length}
                aoRemoverFiltro={aoRemoverFiltro}
                aoLimparFiltros={aoLimparFiltros}
                mostrarConteudo={mostrarConteudo}
                mostrarDivisor={mostrarDivisor}
                estilos={estilos}
                tema={tema}
            />
        );
    }

    let conteudo;
    if (carregando) {
        conteudo = (
            <DiaryHistoryStateView
                tipo="carregando"
                cabecalho={criarCabecalho(false)}
                estilos={estilos}
                tema={tema}
            />
        );
    } else if (possuiErro) {
        conteudo = (
            <DiaryHistoryStateView
                tipo="erro"
                cabecalho={criarCabecalho(false)}
                aoTentarNovamente={aoTentarNovamente}
                estilos={estilos}
                tema={tema}
            />
        );
    } else if (vazio) {
        conteudo = (
            <DiaryHistoryStateView
                tipo={filtrosAtivos ? 'filtro-vazio' : 'vazio'}
                cabecalho={criarCabecalho(filtrosAtivos, false)}
                aoCriar={aoCriar}
                estilos={estilos}
                tema={tema}
            />
        );
    } else {
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
                ListHeaderComponent={criarCabecalho(true, true)}
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
                {!carregando && !possuiErro && (!vazio || filtrosAtivos) ? (
                    <View style={estilos.acaoFixa}>
                        <ButtonScreen texto="Adicionar novo registro" aoPressionar={aoCriar} />
                    </View>
                ) : null}
            </View>
        </MainLayout>
    );
}

export { calcularMargemHorizontalTimeline, DiaryScreen, DivisorTimeline };
