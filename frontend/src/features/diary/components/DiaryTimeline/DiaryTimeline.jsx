// Virtualiza o histórico do Diário com marcadores, paginação e retentativa.
import { memo, useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterApresentacaoFaseRegistro } from '../../utils/diaryPhasePresentation';
import { DiaryEntryCard } from '../DiaryEntryCard/DiaryEntryCard';
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
            const apresentacao = obterApresentacaoFaseRegistro(item.fase);
            const Icone = apresentacao?.Icone;
            return (
                <View style={estilos.item}>
                    <View
                        accessible={false}
                        importantForAccessibility="no-hide-descendants"
                        style={estilos.trilho}
                    >
                        {index > 0 ? <View style={estilos.linhaSuperior} /> : null}
                        <View style={estilos.marcador}>
                            {Icone ? (
                                <Icone
                                    size={24}
                                    color={apresentacao.cor}
                                    weight={item.fase === 'menstrual' ? 'fill' : 'regular'}
                                />
                            ) : null}
                        </View>
                        <View style={estilos.linhaHorizontal} />
                        {index < itens.length - 1 || temMais ? (
                            <View style={estilos.linhaInferior} />
                        ) : null}
                    </View>
                    <View style={estilos.cartao}>
                        <DiaryEntryCard
                            registro={item}
                            aoAbrir={aoAbrir}
                            aoEditar={aoEditar}
                            aoExcluir={aoExcluir}
                            acaoEmAndamento={
                                String(acaoEmAndamentoId) === String(item.id) ? 'excluir' : null
                            }
                        />
                    </View>
                </View>
            );
        },
        [acaoEmAndamentoId, aoAbrir, aoEditar, aoExcluir, estilos, itens.length, temMais]
    );

    const rodape = (
        <>
            {carregandoMais ? (
                <View
                    testID="diary-timeline-loading-more"
                    accessibilityLiveRegion="polite"
                    style={estilos.rodapeCarregando}
                >
                    <ActivityIndicator size="small" color={tema.cores.interface.destaque} />
                    <Text style={estilos.textoCarregando}>Carregando mais registros...</Text>
                </View>
            ) : null}
            {erroCarregarMais ? (
                <View accessibilityRole="alert" style={estilos.rodape}>
                    <Text style={estilos.textoRodape}>
                        Não foi possível carregar mais registros.
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tentar carregar mais registros novamente"
                        disabled={typeof aoTentarCarregarMais !== 'function'}
                        onPress={aoTentarCarregarMais}
                        style={estilos.tentarNovamente}
                    >
                        <Text style={estilos.textoTentarNovamente}>Tentar novamente</Text>
                    </Pressable>
                </View>
            ) : null}
            {ListFooterComponent}
        </>
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
