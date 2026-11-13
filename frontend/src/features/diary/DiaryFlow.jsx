// Integra histórico, resumo, detalhe, criação, edição e exclusão na entrada da aba Diário.
import { useMemo, useState } from 'react';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';

import AlertModal from '../../shared/components/feedback/Modal/AlertModal/AlertModal';
import { useTheme } from '../../shared/hooks/useTheme';
import { obterHojeLocal } from '../calendar/utils/cycleCalendar.utils';
import { EditDiaryEntrySheet } from './components/EditDiaryEntrySheet/EditDiaryEntrySheet';
import { DiaryDeleteDialogs } from './components/DiaryDeleteDialogs/DiaryDeleteDialogs';
import { DiaryFiltersSheet } from './components/DiaryFiltersSheet/DiaryFiltersSheet';
import { NewDiaryEntrySheet } from './components/NewDiaryEntrySheet/NewDiaryEntrySheet';
import {
    calcularAlturaMaximaDetalhes,
    DiaryRecordDetailsModal
} from './components/DiaryRecordDetailsModal/DiaryRecordDetailsModal';
import { criarDescricaoResumo } from './config/diaryOverviewText';
import { useDeleteDiaryEntry } from './hooks/useDeleteDiaryEntry';
import { useDiaryHistory } from './hooks/useDiaryHistory';
import { useDiaryOverview } from './hooks/useDiaryOverview';
import { useDiaryPhase } from './hooks/useDiaryPhase';
import { useDiaryRecordDetails } from './hooks/useDiaryRecordDetails';
import { DiaryScreen } from './screens/DiaryScreen';
import { obterApresentacaoFase } from './utils/diaryPhasePresentation';
import { FILTROS_DIARIO_VAZIOS, normalizarFiltrosDiario } from './utils/diaryFilters';
import { obterRegistrosAdjacentes } from './utils/diaryRecordNavigation';

// Insere um registro sem alterar a coleção original e devolve a ordem mais recente primeiro.
function inserirRegistroOrdenado(registros, novoRegistro) {
    return [...registros, novoRegistro].sort(
        (primeiro, segundo) => segundo.data.localeCompare(primeiro.data) || segundo.id - primeiro.id
    );
}

// Cria uma chave sem conteúdo sensível para invalidar agregações após mutações locais.
function criarChaveAtualizacaoResumo(registros) {
    return registros
        .map(({ id, versao }) => `${id}:${versao ?? 0}`)
        .sort()
        .join('|');
}

// Combina a agregação pessoal com o fallback geral seguro da fase.
function criarResumoDiario({ carregando, fase, resumo, registros = [], temMais = false }) {
    if (carregando) return { carregando: true };
    const apresentacao = obterApresentacaoFase(fase);
    const descricao = criarDescricaoResumo({ fase, resumo });
    if (!apresentacao || !descricao) return null;
    return {
        fase,
        tituloFase: apresentacao.rotulo,
        descricao,
        diasRegistrados:
            resumo?.diasRegistrados ?? new Set(registros.map((registro) => registro.data)).size,
        contagemParcial: resumo ? false : temMais,
        carregando: false
    };
}

// Recebe serviços e callbacks de navegação e retorna o fluxo completo do Diário.
function DiaryFlow({
    service,
    calendarService,
    onSelecionarAba,
    onSessaoExpirada,
    onRegistroCriado,
    aoGerenciarCategorias
}) {
    const tema = useTheme();
    const [criacaoVisivel, setCriacaoVisivel] = useState(false);
    const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
    const [filtros, setFiltros] = useState(FILTROS_DIARIO_VAZIOS);
    const [rotulosCategoriasFiltro, setRotulosCategoriasFiltro] = useState({});
    const historico = useDiaryHistory({ service, filtros, onSessaoExpirada });
    const hoje = useMemo(() => obterHojeLocal(), []);
    const faseAtual = useDiaryPhase({
        ativo: !historico.carregando && historico.registros.length > 0,
        data: hoje,
        service: calendarService,
        onSessaoExpirada
    });
    const chaveAtualizacaoResumo = useMemo(
        () => criarChaveAtualizacaoResumo(historico.registros),
        [historico.registros]
    );
    const resumoPessoal = useDiaryOverview({
        fase: faseAtual.fase,
        chaveAtualizacao: chaveAtualizacaoResumo,
        service,
        onSessaoExpirada
    });
    const resumo = useMemo(
        () =>
            criarResumoDiario({
                carregando: faseAtual.carregando || resumoPessoal.carregando,
                fase: faseAtual.fase,
                resumo: resumoPessoal.resumo,
                registros: historico.registros,
                temMais: historico.temMais
            }),
        [
            faseAtual.carregando,
            faseAtual.fase,
            historico.registros,
            historico.temMais,
            resumoPessoal.carregando,
            resumoPessoal.resumo
        ]
    );
    const detalhes = useDiaryRecordDetails({ service, onSessaoExpirada });
    const edicao = useDiaryRecordDetails({ service, onSessaoExpirada });
    const registrosAdjacentes = useMemo(
        () => obterRegistrosAdjacentes(historico.registros, detalhes.resumoSelecionado?.id),
        [detalhes.resumoSelecionado?.id, historico.registros]
    );
    const exclusao = useDeleteDiaryEntry({
        service,
        onSessaoExpirada,
        onExcluido: (registro) => {
            historico.removerLocalmente(registro.id);
            detalhes.fechar();
        }
    });

    async function registrarCriacao(registro) {
        onRegistroCriado?.(registro);
        await historico.recarregar();
    }

    async function registrarEdicao() {
        await historico.recarregar();
    }

    async function iniciarEdicao(registro) {
        if (!registro) return;
        detalhes.fechar();
        if (Array.isArray(registro.categorias)) {
            edicao.abrirDetalhe(registro);
            return;
        }
        await edicao.abrir(registro);
    }

    function solicitarExclusao(registro) {
        exclusao.solicitar(registro);
    }

    function aplicarFiltros(proximosFiltros, catalogo) {
        const rotulos = {};
        for (const macro of catalogo?.macrocategorias ?? []) {
            for (const categoria of macro.categorias ?? []) rotulos[categoria.id] = categoria.nome;
        }
        setRotulosCategoriasFiltro(rotulos);
        setFiltros(normalizarFiltrosDiario(proximosFiltros));
        setFiltrosVisiveis(false);
    }

    function limparFiltros() {
        setFiltros(FILTROS_DIARIO_VAZIOS);
        setRotulosCategoriasFiltro({});
    }

    function removerFiltro(id) {
        setFiltros((atuais) => {
            if (id === 'dataInicio' || id === 'dataFim') {
                return normalizarFiltrosDiario({ ...atuais, [id]: null });
            }
            const [tipo, valor] = id.split(':');
            if (tipo === 'fase') {
                return normalizarFiltrosDiario({
                    ...atuais,
                    fases: atuais.fases.filter((fase) => fase !== valor)
                });
            }
            if (tipo === 'categoria') {
                return normalizarFiltrosDiario({
                    ...atuais,
                    categorias: atuais.categorias.filter((categoria) => categoria !== valor)
                });
            }
            return atuais;
        });
    }

    async function abrirRegistroAnterior() {
        let alvo = registrosAdjacentes.anterior;
        if (!alvo && historico.temMais) {
            const carregou = await historico.carregarMais();
            if (carregou) {
                alvo = obterRegistrosAdjacentes(
                    historico.obterRegistrosAtuais(),
                    detalhes.resumoSelecionado?.id
                ).anterior;
            }
        }
        if (alvo) await detalhes.abrir(alvo);
    }

    async function abrirRegistroProximo() {
        if (registrosAdjacentes.proximo) await detalhes.abrir(registrosAdjacentes.proximo);
    }

    return (
        <>
            <DiaryScreen
                resumo={resumo}
                registros={historico.registros}
                carregando={historico.carregando}
                atualizando={historico.atualizando}
                carregandoMais={historico.carregandoMais}
                erro={historico.erro}
                erroCarregarMais={historico.erroCarregarMais}
                temMais={historico.temMais}
                aoTentarNovamente={historico.recarregar}
                aoCarregarMais={historico.carregarMais}
                aoTentarCarregarMais={historico.tentarCarregarMais}
                aoCriar={() => setCriacaoVisivel(true)}
                aoAbrirRegistro={detalhes.abrir}
                aoEditarRegistro={iniciarEdicao}
                aoExcluirRegistro={solicitarExclusao}
                registroEmExclusaoId={exclusao.registro?.id}
                filtros={filtros}
                rotulosCategoriasFiltro={rotulosCategoriasFiltro}
                aoAbrirFiltros={() => setFiltrosVisiveis(true)}
                aoRemoverFiltro={removerFiltro}
                aoLimparFiltros={limparFiltros}
                aoGerenciarCategorias={aoGerenciarCategorias}
                onSelecionarAba={onSelecionarAba}
            />

            <NewDiaryEntrySheet
                visivel={criacaoVisivel}
                service={service}
                calendarService={calendarService}
                onFechar={() => setCriacaoVisivel(false)}
                onCriado={registrarCriacao}
                onSessaoExpirada={onSessaoExpirada}
            />

            <DiaryFiltersSheet
                visivel={filtrosVisiveis}
                filtros={filtros}
                service={service}
                aplicando={historico.atualizando}
                onAplicar={aplicarFiltros}
                onFechar={() => setFiltrosVisiveis(false)}
                onSessaoExpirada={onSessaoExpirada}
            />

            <EditDiaryEntrySheet
                visivel={edicao.visivel}
                registro={edicao.registro}
                carregandoRegistro={edicao.carregando}
                erroRegistro={edicao.erro}
                aoRecarregarRegistro={edicao.tentarNovamente}
                service={service}
                calendarService={calendarService}
                onFechar={edicao.fechar}
                onSalvo={registrarEdicao}
                onSessaoExpirada={onSessaoExpirada}
            />

            <DiaryRecordDetailsModal
                visivel={detalhes.visivel}
                registro={detalhes.registro}
                carregando={detalhes.carregando}
                erro={detalhes.erro}
                aoTentarNovamente={detalhes.tentarNovamente}
                aoAnterior={
                    registrosAdjacentes.anterior || historico.temMais
                        ? abrirRegistroAnterior
                        : undefined
                }
                aoProximo={registrosAdjacentes.proximo ? abrirRegistroProximo : undefined}
                aoEditar={detalhes.registro ? iniciarEdicao : undefined}
                aoExcluir={detalhes.registro ? solicitarExclusao : undefined}
                aoFechar={detalhes.fechar}
                excluindo={exclusao.excluindo}
            />

            <AlertModal
                erroInterno
                visivel={Boolean(historico.erroFiltro)}
                aoFechar={historico.fecharErroFiltro}
                icone={WarningCircleIcon}
                titulo="Algo deu errado"
                mensagem={historico.erroFiltro || ''}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: historico.tentarAplicarFiltros,
                    carregando: historico.atualizando || historico.carregando
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: historico.fecharErroFiltro
                }}
            />

            <DiaryDeleteDialogs exclusao={exclusao} tema={tema} />
        </>
    );
}

export {
    calcularAlturaMaximaDetalhes,
    criarChaveAtualizacaoResumo,
    criarResumoDiario,
    DiaryFlow,
    inserirRegistroOrdenado
};
