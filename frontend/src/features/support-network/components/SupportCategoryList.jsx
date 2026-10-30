//Apresenta as categorias de permissão e os estados visuais da coleção.
import { ActivityIndicator, FlatList, Text, View, useWindowDimensions } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { CategoryTitleMetrics } from './CategoryTitleMetrics';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { EmptyState } from '../../../shared/components/feedback/EmptyState/EmptyState';
import { useTheme } from '../../../shared/hooks/useTheme';
import { gruposPermissoes, permissoesGerais } from '../constants/permissionOptions';
import { SupportCategoryCard } from './SupportCategoryCard';
import { criarEstilos } from './SupportCategoryList.styles';

const MENSAGEM_ERRO = 'Não foi possível carregar suas categorias no momento. Tente novamente.';

const TODAS_AS_PERMISSOES = Object.freeze([
    ...permissoesGerais,
    ...gruposPermissoes.flatMap((grupo) => grupo.permissoes)
]);

const ROTULOS_RESUMIDOS = Object.freeze({
    'geral.fase_atual': 'Fase atual',
    'geral.anticoncepcionais': 'Anticoncepcionais',
    'geral.historico_ciclo': 'Histórico de ciclo',
    'geral.alerta_anticoncepcional': 'Alertas de anticoncepcional',
    'geral.dicas': 'Dicas',
    'emocional.sintomas_emocionais': 'Humor'
});

const PERMISSOES_CONHECIDAS = new Set(TODAS_AS_PERMISSOES.map((permissao) => permissao.id));

const ROTULO_POR_PERMISSAO = new Map(
    TODAS_AS_PERMISSOES.map((permissao) => [
        permissao.id,
        ROTULOS_RESUMIDOS[permissao.id] ?? limparRotulo(permissao.titulo)
    ])
);

function limparRotulo(rotulo) {
    if (typeof rotulo !== 'string') {
        return '';
    }

    return rotulo
        .replace(/^Acesso (?:à|ao|aos|às?)\s+/iu, '')
        .replace(/^Receber\s+/iu, '')
        .trim();
}

function normalizarPermissoes(dadosVisiveis) {
    if (!Array.isArray(dadosVisiveis)) {
        return [];
    }

    return [
        ...new Set(
            dadosVisiveis.filter(
                (permissao) => typeof permissao === 'string' && PERMISSOES_CONHECIDAS.has(permissao)
            )
        )
    ];
}

function criarResumoPermissoes(dadosVisiveis) {
    const permissoes = normalizarPermissoes(dadosVisiveis);

    if (permissoes.length === TODAS_AS_PERMISSOES.length) {
        return 'Todos os dados permitidos';
    }

    if (permissoes.length === 0) {
        return 'Nenhum dado permitido';
    }

    if (permissoes.length === 1) {
        const rotulo = ROTULO_POR_PERMISSAO.get(permissoes[0]);

        return `Apenas ${rotulo} permitido`;
    }

    return `${permissoes.length} tipos de dado permitidos`;
}

function categoriaEhValida(categoria) {
    return (
        categoria !== null &&
        typeof categoria === 'object' &&
        !Array.isArray(categoria) &&
        (typeof categoria.id === 'string' || Number.isSafeInteger(categoria.id)) &&
        typeof categoria.nome === 'string' &&
        categoria.nome.trim().length > 0
    );
}

function ordenarCategorias(categorias) {
    if (!Array.isArray(categorias)) {
        return [];
    }

    return categorias
        .filter(categoriaEhValida)
        .slice()
        .sort((categoriaA, categoriaB) =>
            categoriaA.nome.localeCompare(categoriaB.nome, 'pt-BR', {
                sensitivity: 'base'
            })
        );
}

function SupportCategoryList({
    categorias = [],
    carregando = false,
    atualizando = false,
    erro = null,
    onEditar,
    onExcluir,
    onCriar,
    onTentarNovamente,
    categoriaEmAndamentoId = null,
    acaoEmAndamento = null,
    desabilitado = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const categoriasOrdenadas = useMemo(() => ordenarCategorias(categorias), [categorias]);
    const { fontScale } = useWindowDimensions();
    const [medidas, setMedidas] = useState({});
    const [larguraTitulo, setLarguraTitulo] = useState(0);
    const medirNome = useCallback(
        (nome, largura) => {
            if (largura > 0)
                setMedidas((atual) =>
                    atual[`${fontScale}:${nome}`] === largura
                        ? atual
                        : { ...atual, [`${fontScale}:${nome}`]: largura }
                );
        },
        [fontScale]
    );
    const medirEspaco = useCallback((largura) => {
        if (largura > 0) setLarguraTitulo(largura);
    }, []);
    const maiorNome = Math.max(
        0,
        ...categoriasOrdenadas.map((categoria) => medidas[`${fontScale}:${categoria.nome}`] || 0)
    );
    const fonteTitulo =
        maiorNome > 0 && larguraTitulo > 0
            ? Math.min(
                  18,
                  Math.floor(((14 * Math.max(1, larguraTitulo - 2)) / maiorNome) * 100) / 100
              )
            : 18;

    const possuiCategorias = categoriasOrdenadas.length > 0;

    const carregamentoInicial = carregando && !possuiCategorias;

    const erroInicial = Boolean(erro) && !possuiCategorias;

    const estadoVazio = !carregamentoInicial && !erroInicial && !possuiCategorias;

    const renderizarCategoria = useCallback(
        ({ item }) => {
            const categoriaCarregando = item.id === categoriaEmAndamentoId;

            return (
                <SupportCategoryCard
                    fonteTitulo={fonteTitulo}
                    onMedirTitulo={medirEspaco}
                    categoria={item}
                    resumoPermissoes={criarResumoPermissoes(item.dadosVisiveis)}
                    quantidadeContatos={item.quantidadeContatos}
                    onEditar={onEditar}
                    onExcluir={onExcluir}
                    desabilitado={desabilitado}
                    acaoEmAndamento={categoriaCarregando ? acaoEmAndamento : null}
                />
            );
        },
        [
            acaoEmAndamento,
            categoriaEmAndamentoId,
            desabilitado,
            onEditar,
            onExcluir,
            fonteTitulo,
            medirEspaco
        ]
    );

    const extrairChave = useCallback((categoria) => String(categoria.id), []);

    function renderizarAtualizacao() {
        if (!atualizando) {
            return null;
        }

        return (
            <View
                accessibilityLabel="Atualizando categorias"
                accessibilityLiveRegion="polite"
                style={estilos.atualizacao}
            >
                <ActivityIndicator color={tema.cores.interface.destaque} size="small" />

                <Text style={estilos.textoAtualizacao}>Atualizando categorias...</Text>
            </View>
        );
    }

    function renderizarConteudo() {
        if (carregamentoInicial) {
            return (
                <View
                    testID="support-category-loading"
                    accessibilityLabel="Carregando categorias"
                    accessibilityLiveRegion="polite"
                    style={estilos.estadoCentral}
                >
                    <ActivityIndicator color={tema.cores.interface.destaque} size="large" />

                    <Text style={estilos.textoCarregamento}>Carregando categorias...</Text>
                </View>
            );
        }

        if (erroInicial) {
            return (
                <View style={estilos.estadoCentral}>
                    <EmptyState
                        titulo="Ocorreu um erro"
                        mensagem={MENSAGEM_ERRO}
                        variante="erro"
                        acao={
                            <ButtonScreen
                                texto="Tentar Novamente"
                                aoPressionar={onTentarNovamente}
                                variante="preto"
                                desativado={desabilitado}
                            />
                        }
                    />
                </View>
            );
        }

        if (estadoVazio) {
            return (
                <View style={estilos.estadoCentral}>
                    <EmptyState
                        titulo="Nenhuma categoria registrada"
                        mensagem="Você ainda não criou nenhuma categoria de permissão. Toque em 'Criar nova categoria' para organizar sua Rede de Apoio."
                        variante="vazio"
                    />
                </View>
            );
        }

        return (
            <FlatList
                testID="support-category-list"
                data={categoriasOrdenadas}
                keyExtractor={extrairChave}
                renderItem={renderizarCategoria}
                ListHeaderComponent={renderizarAtualizacao}
                contentContainerStyle={estilos.conteudoLista}
                ItemSeparatorComponent={() => <Separador estilo={estilos.separador} />}
                refreshing={Boolean(atualizando)}
                onRefresh={typeof onTentarNovamente === 'function' ? onTentarNovamente : undefined}
                initialNumToRender={6}
                maxToRenderPerBatch={6}
                updateCellsBatchingPeriod={50}
                windowSize={7}
                removeClippedSubviews
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            />
        );
    }

    const mostrarAcaoCriar = !carregamentoInicial && !erroInicial;

    return (
        <View style={estilos.container}>
            <CategoryTitleMetrics
                categorias={categoriasOrdenadas}
                escala={fontScale}
                onMedir={medirNome}
            />
            <View style={estilos.conteudo}>{renderizarConteudo()}</View>

            {mostrarAcaoCriar ? (
                <View style={estilos.acaoFixa}>
                    <ButtonScreen
                        texto="Criar nova categoria"
                        aoPressionar={onCriar}
                        variante="laranja"
                        desativado={desabilitado}
                        rotuloAcessibilidade="Criar nova categoria de permissão"
                    />
                </View>
            ) : null}
        </View>
    );
}

function Separador({ estilo }) {
    return <View importantForAccessibility="no" style={estilo} />;
}

export { criarResumoPermissoes, ordenarCategorias, SupportCategoryList };
