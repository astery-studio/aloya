// Virtualiza o histórico do Diário com marcadores, paginação e retentativa.
import { memo, useCallback, useMemo, useRef } from 'react';
import { FlatList } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { DiaryTimelineItem } from '../DiaryTimelineItem/DiaryTimelineItem';
import { DiaryTimelinePaginationFooter } from '../DiaryTimelinePaginationFooter/DiaryTimelinePaginationFooter';
import { criarEstilos } from './DiaryTimeline.styles';

// Recebe resumos paginados e retorna uma FlatList otimizada e acessível.
function DiaryTimeline({
    registros = [],
    aoAbrir,
    aoEditar,
    aoExcluir,
    acaoEmAndamentoId = null,
    aoCarregarMais,
    aoTentarCarregarMais,
    carregandoMais = false,
    erroCarregarMais = false,
    temMais = false,
    ListHeaderComponent = null,
    ListFooterComponent = null,
    contentContainerStyle
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const usuarioIniciouRolagem = useRef(false);
    const itens = Array.isArray(registros)
        ? registros.filter((registro) => registro && typeof registro === 'object')
        : [];
    const podeCarregarMais =
        temMais && !carregandoMais && !erroCarregarMais && typeof aoCarregarMais === 'function';

    const registrarInicioRolagem = useCallback(() => {
        usuarioIniciouRolagem.current = true;
    }, []);

    const carregarMaisAoFim = useCallback(() => {
        if (!podeCarregarMais || !usuarioIniciouRolagem.current) return;
        usuarioIniciouRolagem.current = false;
        aoCarregarMais();
    }, [aoCarregarMais, podeCarregarMais]);

    const renderizar = useCallback(
        ({ item, index }) => {
            return (
                <DiaryTimelineItem
                    item={item}
                    indice={index}
                    quantidade={itens.length}
                    temMais={temMais}
                    acaoEmAndamentoId={acaoEmAndamentoId}
                    aoAbrir={aoAbrir}
                    aoEditar={aoEditar}
                    aoExcluir={aoExcluir}
                    estilos={estilos}
                />
            );
        },
        [acaoEmAndamentoId, aoAbrir, aoEditar, aoExcluir, estilos, itens.length, temMais]
    );

    const rodape = (
        <DiaryTimelinePaginationFooter
            carregando={carregandoMais}
            erro={erroCarregarMais}
            aoTentarNovamente={aoTentarCarregarMais}
            estilos={estilos}
            tema={tema}
        >
            {ListFooterComponent}
        </DiaryTimelinePaginationFooter>
    );

    return (
        <FlatList
            testID="diary-timeline"
            data={itens}
            renderItem={renderizar}
            keyExtractor={(item) => String(item.id)}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={rodape}
            onScrollBeginDrag={registrarInicioRolagem}
            onMomentumScrollBegin={registrarInicioRolagem}
            onEndReached={podeCarregarMais ? carregarMaisAoFim : undefined}
            onEndReachedThreshold={0.35}
            contentContainerStyle={[estilos.lista, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            updateCellsBatchingPeriod={50}
            windowSize={5}
            removeClippedSubviews
        />
    );
}

const MemoizedDiaryTimeline = memo(DiaryTimeline);

export { MemoizedDiaryTimeline as DiaryTimeline };
