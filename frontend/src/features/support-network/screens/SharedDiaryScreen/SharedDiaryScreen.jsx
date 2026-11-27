import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import { FunnelIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { MainLayout } from '../../../../shared/layouts/MainLayout/MainLayout';
import { DiaryActiveFilters } from '../../../diary/components/DiaryActiveFilters/DiaryActiveFilters';
import { DiaryFiltersSheet } from '../../../diary/components/DiaryFiltersSheet/DiaryFiltersSheet';
import { DiaryOverviewCard } from '../../../diary/components/DiaryOverviewCard/DiaryOverviewCard';
import { DiaryRecordDetailsModal } from '../../../diary/components/DiaryRecordDetailsModal/DiaryRecordDetailsModal';
import { DiaryTimeline } from '../../../diary/components/DiaryTimeline/DiaryTimeline';
import { useDiaryHistory } from '../../../diary/hooks/useDiaryHistory';
import { FILTROS_DIARIO_VAZIOS, possuiFiltrosDiario } from '../../../diary/utils/diaryFilters';
import { obterRegistrosAdjacentes } from '../../../diary/utils/diaryRecordNavigation';
import { SharedContentState } from '../../components/SharedContentState/SharedContentState';
import { gruposPermissoes } from '../../constants/permissionOptions';
import { useSharedContent } from '../../hooks/useSharedContent';

const ROTULOS_CATEGORIAS = Object.fromEntries(
    gruposPermissoes.flatMap(({ permissoes }) =>
        permissoes.map(({ id, titulo }) => [id.split('.')[1], titulo])
    )
);

function SharedDiaryScreen({ nomeTitular, permissoes, service, onSelecionarAba, abasDisponiveis }) {
    const tema = useTheme();
    const [filtros, setFiltros] = useState(FILTROS_DIARIO_VAZIOS);
    const [filtroAberto, setFiltroAberto] = useState(false);
    const [registroId, setRegistroId] = useState(null);
    const historico = useDiaryHistory({ service, filtros });
    const categoriasPermitidas = useMemo(
        () => permissoes.filter((id) => !id.startsWith('geral.')).map((id) => id.split('.')[1]),
        [permissoes]
    );
    const buscarDetalhe = useCallback(
        (opcoes) => service.buscarDetalhe(registroId, opcoes),
        [registroId, service]
    );
    const detalhe = useSharedContent(registroId ? buscarDetalhe : null);
    const adjacentes = obterRegistrosAdjacentes(historico.registros, registroId);
    const filtrosAtivos = possuiFiltrosDiario(filtros);
    const erro = historico.erro || historico.erroFiltro;

    function removerFiltro(id) {
        const [tipo, valor] = id.split(':');
        if (tipo === 'categoria' || tipo === 'fase') {
            const chave = tipo === 'fase' ? 'fases' : 'categorias';
            setFiltros((atuais) => ({
                ...atuais,
                [chave]: atuais[chave].filter((item) => item !== valor)
            }));
        } else if (tipo === 'dataInicio' || tipo === 'dataFim') {
            setFiltros((atuais) => ({ ...atuais, [tipo]: null }));
        }
    }

    return (
        <MainLayout
            titulo="Diário"
            varianteHeader="redeApoio"
            abaAtiva="diario"
            abasDisponiveis={abasDisponiveis}
            onSelecionarAba={onSelecionarAba}
            acoesHeader={
                <IconButton
                    icone={FunnelIcon}
                    variante="redeApoio"
                    corIcone={tema.cores.interface.destaque}
                    rotuloAcessibilidade="Filtrar histórico do Diário"
                    aoPressionar={() => setFiltroAberto(true)}
                />
            }
        >
            {erro || historico.carregando ? (
                <SharedContentState
                    status={erro ? 'erro' : 'carregando'}
                    aoTentarNovamente={historico.recarregar}
                />
            ) : historico.registros.length || filtrosAtivos ? (
                <DiaryTimeline
                    registros={historico.registros}
                    somenteLeitura
                    aoAbrir={({ id }) => setRegistroId(id)}
                    temMais={historico.temMais}
                    carregandoMais={historico.carregandoMais}
                    erroCarregarMais={historico.erroCarregarMais}
                    aoCarregarMais={historico.carregarMais}
                    aoTentarCarregarMais={historico.tentarCarregarMais}
                    contentContainerStyle={estilos.conteudo}
                    ListHeaderComponent={
                        filtrosAtivos ? (
                            <DiaryActiveFilters
                                filtros={filtros}
                                rotulosCategorias={ROTULOS_CATEGORIAS}
                                quantidadeResultados={historico.registros.length}
                                aoLimpar={() => setFiltros(FILTROS_DIARIO_VAZIOS)}
                                aoRemover={removerFiltro}
                            />
                        ) : (
                            <DiaryOverviewCard
                                nomeTitular={nomeTitular}
                                diasRegistrados={historico.registros.length}
                                contagemParcial={historico.temMais}
                            />
                        )
                    }
                    ListFooterComponent={historico.registros.length ? null : <SharedContentState />}
                />
            ) : (
                <SharedContentState />
            )}
            <DiaryFiltersSheet
                visivel={filtroAberto}
                filtros={filtros}
                service={service}
                categoriasPermitidas={categoriasPermitidas}
                exibirFiltroFases={
                    permissoes.includes('geral.fase_atual') &&
                    permissoes.includes('geral.historico_ciclo')
                }
                onFechar={() => setFiltroAberto(false)}
                onAplicar={(novosFiltros) => {
                    setFiltros(novosFiltros);
                    setFiltroAberto(false);
                }}
            />
            {detalhe.dados ? (
                <DiaryRecordDetailsModal
                    visivel
                    registro={detalhe.dados}
                    nomeTitular={nomeTitular}
                    somenteLeitura
                    aoAnterior={
                        adjacentes.anterior
                            ? () => setRegistroId(adjacentes.anterior.id)
                            : undefined
                    }
                    aoProximo={
                        adjacentes.proximo ? () => setRegistroId(adjacentes.proximo.id) : undefined
                    }
                    aoFechar={() => setRegistroId(null)}
                />
            ) : detalhe.status === 'erro' ? (
                <View style={estilos.falhaDetalhe}>
                    <SharedContentState status="erro" aoTentarNovamente={detalhe.recarregar} />
                </View>
            ) : null}
        </MainLayout>
    );
}

const estilos = StyleSheet.create({
    conteudo: { paddingHorizontal: 16 },
    falhaDetalhe: { minHeight: 140 }
});

export { SharedDiaryScreen };
