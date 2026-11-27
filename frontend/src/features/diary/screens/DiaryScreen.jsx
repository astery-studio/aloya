// Apresenta os estados visualmente fiéis do histórico dentro do layout principal do app.
import { useMemo } from 'react';
import { View } from 'react-native';
import { FunnelIcon } from 'phosphor-react-native/src/icons/Funnel';
import { GearSixIcon } from 'phosphor-react-native/src/icons/GearSix';

import { FloatingActionButton } from '../../../shared/components/common/FloatingActionButton';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import { obterCoresDiario } from '../config/diaryColors';
import {
    DiaryHistoryHeader,
    DiaryTimelineDivider as DivisorTimeline
} from '../components/DiaryHistoryHeader/DiaryHistoryHeader';
import { DiaryHistoryStateView } from '../components/DiaryHistoryStateView/DiaryHistoryStateView';
import { DiaryTimeline } from '../components/DiaryTimeline/DiaryTimeline';
import { possuiFiltrosDiario } from '../utils/diaryFilters';
import { criarEstilos } from './DiaryScreen.styles';

// Recebe estado e callbacks do fluxo e retorna loading, erro, vazio ou histórico preenchido.
function DiaryScreen({
    resumo,
    somenteLeitura = false,
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
    const coresDiario = obterCoresDiario(tema);
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const itens = Array.isArray(registros) ? registros : [];
    const possuiErro = typeof erro === 'string' && erro.trim();
    const filtrosAtivos = possuiFiltrosDiario(filtros);
    const vazio = !carregando && !possuiErro && itens.length === 0;
    const mostrarFab =
        !somenteLeitura && !carregando && !possuiErro && typeof aoCriar === 'function';
    const possuiAcoesHeader =
        typeof aoAbrirFiltros === 'function' || typeof aoGerenciarCategorias === 'function';

    const acoesHeader = possuiAcoesHeader ? (
        <>
            {typeof aoAbrirFiltros === 'function' ? (
                <IconButton
                    icone={FunnelIcon}
                    aoPressionar={aoAbrirFiltros}
                    rotuloAcessibilidade="Filtrar histórico do Diário"
                    variante="redeApoio"
                />
            ) : null}
            {typeof aoGerenciarCategorias === 'function' ? (
                <IconButton
                    icone={GearSixIcon}
                    aoPressionar={aoGerenciarCategorias}
                    rotuloAcessibilidade="Gerenciar categorias do Diário"
                    variante="redeApoioSecundario"
                />
            ) : null}
        </>
    ) : null;

    function criarCabecalho(mostrarConteudo, mostrarDivisor) {
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
                somenteLeitura={somenteLeitura}
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
                somenteLeitura={somenteLeitura}
                cabecalho={criarCabecalho(false)}
                estilos={estilos}
                tema={tema}
            />
        );
    } else if (possuiErro) {
        conteudo = (
            <DiaryHistoryStateView
                tipo="erro"
                somenteLeitura={somenteLeitura}
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
                somenteLeitura={somenteLeitura}
                cabecalho={criarCabecalho(filtrosAtivos, false)}
                estilos={estilos}
                tema={tema}
            />
        );
    } else {
        conteudo = (
            <DiaryTimeline
                registros={itens}
                somenteLeitura={somenteLeitura}
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
                contentContainerStyle={estilos.lista}
            />
        );
    }

    return (
        <MainLayout
            titulo="Diário"
            varianteHeader="redeApoio"
            abaAtiva="diario"
            onSelecionarAba={onSelecionarAba}
            acoesHeader={acoesHeader}
            corFundo={tema.escuro ? coresDiario.interface.fundo : undefined}
            corFundoNavegacao={coresDiario.interface.superficie}
        >
            <View testID="diary-main-container" style={estilos.tela}>
                {conteudo}
                {mostrarFab ? (
                    <FloatingActionButton
                        aoPressionar={aoCriar}
                        rotuloAcessibilidade="Adicionar novo registro ao Diário"
                        considerarAreaSeguraInferior={false}
                        testID="diary-add-fab"
                    />
                ) : null}
            </View>
        </MainLayout>
    );
}

export { DiaryScreen, DivisorTimeline };
