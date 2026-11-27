import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DiaryFiltersSheet } from '../../../diary/components/DiaryFiltersSheet/DiaryFiltersSheet';
import { DiaryRecordDetailsModal } from '../../../diary/components/DiaryRecordDetailsModal/DiaryRecordDetailsModal';
import { criarDescricaoResumo } from '../../../diary/config/diaryOverviewText';
import { useDiaryHistory } from '../../../diary/hooks/useDiaryHistory';
import { DiaryScreen } from '../../../diary/screens/DiaryScreen';
import { FILTROS_DIARIO_VAZIOS } from '../../../diary/utils/diaryFilters';
import { obterApresentacaoFase } from '../../../diary/utils/diaryPhasePresentation';
import { obterRegistrosAdjacentes } from '../../../diary/utils/diaryRecordNavigation';
import { SharedContentState } from '../../components/SharedContentState/SharedContentState';
import { gruposPermissoes } from '../../constants/permissionOptions';
import { useSharedContent } from '../../hooks/useSharedContent';

const ROTULOS_CATEGORIAS = Object.fromEntries(
    gruposPermissoes.flatMap(({ permissoes }) =>
        permissoes.map(({ id, titulo }) => [id.split('.')[1], titulo])
    )
);

function SharedDiaryScreen({ nomeTitular, permissoes, service, onSelecionarAba }) {
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
    const resumo = useSharedContent(service.buscarResumo);
    const adjacentes = obterRegistrosAdjacentes(historico.registros, registroId);
    const permiteFase = permissoes.includes('geral.fase_atual');
    const fase = permiteFase ? resumo.dados?.fase : null;

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
        <>
            <DiaryScreen
                somenteLeitura
                resumo={{
                    nomeTitular,
                    fase,
                    tituloFase: obterApresentacaoFase(fase)?.rotulo,
                    exibirFase: permiteFase,
                    descricao: fase
                        ? criarDescricaoResumo({ fase, resumo: resumo.dados, nomeTitular })
                        : null,
                    diasRegistrados:
                        resumo.dados?.diasRegistrados ??
                        new Set(historico.registros.map(({ data }) => data)).size,
                    contagemParcial: !resumo.dados && historico.temMais,
                    carregando: resumo.status === 'carregando'
                }}
                registros={historico.registros}
                carregando={historico.carregando}
                atualizando={historico.atualizando}
                carregandoMais={historico.carregandoMais}
                erro={historico.erro || historico.erroFiltro}
                erroCarregarMais={historico.erroCarregarMais}
                temMais={historico.temMais}
                aoTentarNovamente={historico.recarregar}
                aoCarregarMais={historico.carregarMais}
                aoTentarCarregarMais={historico.tentarCarregarMais}
                aoAbrirRegistro={({ id }) => setRegistroId(id)}
                filtros={filtros}
                rotulosCategoriasFiltro={ROTULOS_CATEGORIAS}
                aoAbrirFiltros={() => setFiltroAberto(true)}
                aoRemoverFiltro={removerFiltro}
                aoLimparFiltros={() => setFiltros(FILTROS_DIARIO_VAZIOS)}
                onSelecionarAba={onSelecionarAba}
            />
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
        </>
    );
}

const estilos = StyleSheet.create({
    falhaDetalhe: { minHeight: 140 }
});

export { SharedDiaryScreen };
