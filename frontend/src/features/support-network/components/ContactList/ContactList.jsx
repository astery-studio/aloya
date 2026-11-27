//Apresenta os contatos agrupados por estado em uma lista virtualizada.
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useCallback, useMemo } from 'react';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { EmptyState } from '../../../../shared/components/feedback/EmptyState/EmptyState';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';
import { criarEstilosErro } from '../../../../shared/theme/errorStateStyles';
import { ContactCard } from '../ContactCard/ContactCard';
import { criarEstilos } from './ContactList.styles';

const MENSAGEM_ERRO = 'Não foi possível carregar sua Rede de Apoio no momento. Tente novamente.';

const MENSAGEM_VAZIA_ENVIADA =
    'Você ainda não adicionou nenhum contato à sua Rede de Apoio. Use o botão de adicionar para convidar alguém de confiança.';

const MENSAGEM_VAZIA_RECEBIDA =
    'Você ainda não recebeu nenhum convite para participar de uma Rede de Apoio.';

const ORDEM_STATUS = Object.freeze({
    pendente: 0,
    ativo: 1,
    inativo: 2,
    recusado: 3
});

const STATUS_ORDENADOS_POR_DATA = new Set(['pendente', 'recusado']);

const GRUPOS_CONTATOS = Object.freeze([
    Object.freeze({
        status: 'pendente',
        titulo: 'PENDENTES'
    }),
    Object.freeze({
        status: 'ativo',
        titulo: 'ATIVOS'
    }),
    Object.freeze({
        status: 'inativo',
        titulo: 'INATIVOS'
    }),
    Object.freeze({
        status: 'recusado',
        titulo: 'RECUSADOS'
    })
]);

function contatoEhValido(contato) {
    return (
        contato !== null &&
        typeof contato === 'object' &&
        !Array.isArray(contato) &&
        (Number.isSafeInteger(contato.id) ||
            (typeof contato.id === 'string' && contato.id.trim().length > 0)) &&
        Object.hasOwn(ORDEM_STATUS, contato.status)
    );
}

function obterIdentificacaoOrdenacao(contato) {
    const candidatos = [contato?.identificacao, contato?.nome, contato?.email];

    const identificacao = candidatos.find(
        (valor) => typeof valor === 'string' && valor.trim().length > 0
    );

    return identificacao?.trim() ?? '';
}

function obterDataConviteOrdenacao(contato) {
    const data = Date.parse(contato?.dataConvite ?? contato?.dataEnvio ?? '');

    return Number.isFinite(data) ? data : null;
}

function ordenarContatos(contatos) {
    if (!Array.isArray(contatos)) {
        return [];
    }

    return contatos
        .filter(contatoEhValido)
        .slice()
        .sort((primeiro, segundo) => {
            const prioridade = ORDEM_STATUS[primeiro.status] - ORDEM_STATUS[segundo.status];

            if (prioridade !== 0) {
                return prioridade;
            }

            if (STATUS_ORDENADOS_POR_DATA.has(primeiro.status)) {
                const dataPrimeiro = obterDataConviteOrdenacao(primeiro);
                const dataSegundo = obterDataConviteOrdenacao(segundo);

                if (dataPrimeiro !== null && dataSegundo !== null && dataPrimeiro !== dataSegundo) {
                    return dataSegundo - dataPrimeiro;
                }
            }

            const porNome = obterIdentificacaoOrdenacao(primeiro).localeCompare(
                obterIdentificacaoOrdenacao(segundo),
                'pt-BR',
                {
                    numeric: true,
                    sensitivity: 'base'
                }
            );

            if (porNome !== 0) {
                return porNome;
            }

            return String(primeiro.id).localeCompare(String(segundo.id), 'pt-BR', {
                numeric: true
            });
        });
}

function criarRotuloQuantidade(quantidade) {
    return quantidade === 1 ? '1 CONTATO' : `${quantidade} CONTATOS`;
}

function criarItensAgrupados(contatos, { modoAcompanhamento, vinculoVisualizadoId } = {}) {
    const contatosOrdenados = ordenarContatos(contatos);

    const grupos = modoAcompanhamento
        ? [
              { status: 'pendente', titulo: 'CONVITES' },
              { status: 'ativo', titulo: 'CONTATO EM VISUALIZAÇÃO', selecionado: true },
              { status: 'ativo', titulo: 'ATIVOS', selecionado: false }
          ]
        : GRUPOS_CONTATOS;

    return grupos.flatMap((grupo) => {
        const itensDoGrupo = contatosOrdenados.filter((contato) => contato.status === grupo.status);
        const itensVisiveis =
            grupo.selecionado === undefined
                ? itensDoGrupo
                : itensDoGrupo.filter(
                      ({ id }) => (id === vinculoVisualizadoId) === grupo.selecionado
                  );

        if (itensVisiveis.length === 0) {
            return [];
        }

        return [
            {
                tipo: 'cabecalho',
                id: grupo.selecionado ? 'cabecalho-visualizado' : `cabecalho-${grupo.status}`,
                titulo: grupo.titulo,
                quantidade: grupo.selecionado ? null : itensVisiveis.length
            },
            ...itensVisiveis.map((contato) => ({
                tipo: 'contato',
                id: `contato-${contato.id}`,
                contato
            }))
        ];
    });
}

function ContactList({
    contatos = [],
    perspectiva = 'enviado',
    carregando = false,
    atualizando = false,
    erro = null,
    filtroAtivo = false,
    aoAcao,
    aoVisualizar,
    vinculoVisualizadoId,
    aoAbrirResumo,
    aoTentarNovamente,
    contatoEmAndamentoId = null,
    acaoEmAndamento = null,
    desabilitado = false,
    cabecalho = null,
    rotuloFiltro = 'FILTROS APLICADOS'
}) {
    const tema = useTheme();
    const destaque = tema.escuro ? coresNoturnasConteudo.verde : tema.cores.interface.destaque;

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const estilosErro = useMemo(() => criarEstilosErro(tema), [tema]);

    const itens = useMemo(
        () =>
            criarItensAgrupados(contatos, {
                modoAcompanhamento: Boolean(aoVisualizar),
                vinculoVisualizadoId
            }),
        [aoVisualizar, contatos, vinculoVisualizadoId]
    );

    const possuiContatos = itens.some((item) => item.tipo === 'contato');

    const carregamentoInicial = carregando && !possuiContatos;

    const erroInicial = Boolean(erro) && !possuiContatos;

    const estadoSemResultado =
        !carregamentoInicial && !erroInicial && !possuiContatos && filtroAtivo;

    const estadoVazio = !carregamentoInicial && !erroInicial && !possuiContatos && !filtroAtivo;

    const renderizarItem = useCallback(
        ({ item }) => {
            if (item.tipo === 'cabecalho') {
                const quantidade =
                    item.quantidade === null ? null : criarRotuloQuantidade(item.quantidade);
                return (
                    <View
                        accessibilityRole="header"
                        accessibilityLabel={
                            quantidade ? `${item.titulo}, ${quantidade}` : item.titulo
                        }
                        style={estilos.cabecalhoGrupo}
                    >
                        <View style={estilos.linhaGrupo} />

                        <Text style={estilos.tituloGrupo}>
                            {quantidade ? `${item.titulo} (${quantidade})` : item.titulo}
                        </Text>

                        <View style={estilos.linhaGrupo} />
                    </View>
                );
            }

            const contatoEmAndamento = String(item.contato.id) === String(contatoEmAndamentoId);

            return (
                <ContactCard
                    contato={item.contato}
                    perspectiva={perspectiva}
                    aoAcao={aoAcao}
                    aoVisualizar={aoVisualizar}
                    emVisualizacao={item.contato.id === vinculoVisualizadoId}
                    aoAbrirResumo={aoAbrirResumo}
                    acaoEmAndamento={contatoEmAndamento ? acaoEmAndamento : null}
                    desabilitado={desabilitado}
                />
            );
        },
        [
            acaoEmAndamento,
            aoAbrirResumo,
            aoAcao,
            aoVisualizar,
            contatoEmAndamentoId,
            desabilitado,
            estilos,
            perspectiva,
            vinculoVisualizadoId
        ]
    );

    const extrairChave = useCallback((item) => item.id, []);

    const renderizarAtualizacao = useCallback(() => {
        if (!atualizando) {
            return null;
        }

        return (
            <View
                accessibilityLabel="Atualizando contatos"
                accessibilityLiveRegion="polite"
                style={estilos.atualizacao}
            >
                <ActivityIndicator color={destaque} size="small" />

                <Text style={estilos.textoAtualizacao}>Atualizando contatos...</Text>
            </View>
        );
    }, [atualizando, destaque, estilos]);

    const renderizarCabecalho = useCallback(
        () => (
            <>
                {cabecalho}
                {renderizarAtualizacao()}
            </>
        ),
        [cabecalho, renderizarAtualizacao]
    );

    const renderizarEstadoSemResultado = useCallback(
        () => (
            <View style={estilos.resultadoFiltroVazio}>
                <View
                    accessibilityRole="header"
                    accessibilityLabel={`${rotuloFiltro}, 0 registros`}
                    style={estilos.cabecalhoGrupo}
                >
                    <View style={estilos.linhaGrupo} />

                    <Text style={estilos.tituloGrupo}>{rotuloFiltro} (0)</Text>

                    <View style={estilos.linhaGrupo} />
                </View>

                <Text style={estilos.mensagemFiltroVazio}>
                    Nenhum registro encontrado para os filtros aplicados.
                </Text>
            </View>
        ),
        [estilos, rotuloFiltro]
    );

    if (carregamentoInicial) {
        return (
            <View style={estilos.estadoComCabecalho}>
                {cabecalho}

                <View
                    testID="contact-list-loading"
                    accessibilityLabel="Carregando contatos"
                    accessibilityLiveRegion="polite"
                    style={estilos.estadoCentral}
                >
                    <ActivityIndicator color={destaque} size="large" />

                    <Text style={estilos.textoCarregamento}>Carregando contatos...</Text>
                </View>
            </View>
        );
    }

    if (erroInicial) {
        return (
            <View style={estilos.estadoComCabecalho}>
                {cabecalho}

                <View style={estilos.estadoCentral}>
                    <EmptyState
                        usarPaletaNoturnaConteudo
                        titulo="Ocorreu um erro"
                        mensagem={MENSAGEM_ERRO}
                        variante="erro"
                        acao={
                            <ButtonScreen
                                estilo={[estilos.botaoEstado, estilosErro.botao]}
                                estiloTexto={estilosErro.textoBotao}
                                texto="Tentar novamente"
                                aoPressionar={aoTentarNovamente}
                                variante="preto"
                                desativado={desabilitado}
                            />
                        }
                    />
                </View>
            </View>
        );
    }

    if (estadoVazio) {
        const recebido = perspectiva === 'recebido';

        return (
            <View style={estilos.estadoComCabecalho}>
                {cabecalho}

                <View style={estilos.estadoCentral}>
                    <EmptyState
                        usarPaletaNoturnaConteudo
                        titulo={
                            aoVisualizar
                                ? 'Nada para exibir'
                                : recebido
                                  ? 'Nenhum convite recebido'
                                  : 'Nenhum contato'
                        }
                        mensagem={
                            aoVisualizar
                                ? 'Ainda não há dados suficientes para exibir aqui.'
                                : recebido
                                  ? MENSAGEM_VAZIA_RECEBIDA
                                  : MENSAGEM_VAZIA_ENVIADA
                        }
                        variante="vazio"
                    />
                </View>
            </View>
        );
    }

    return (
        <FlatList
            testID="contact-list"
            data={itens}
            keyExtractor={extrairChave}
            renderItem={renderizarItem}
            ListHeaderComponent={renderizarCabecalho}
            ListEmptyComponent={estadoSemResultado ? renderizarEstadoSemResultado : null}
            contentContainerStyle={estilos.conteudoLista}
            ItemSeparatorComponent={() => <Separador estilo={estilos.separador} />}
            refreshing={Boolean(atualizando)}
            onRefresh={typeof aoTentarNovamente === 'function' ? aoTentarNovamente : undefined}
            initialNumToRender={8}
            maxToRenderPerBatch={6}
            updateCellsBatchingPeriod={50}
            windowSize={7}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        />
    );
}

function Separador({ estilo }) {
    return <View importantForAccessibility="no" style={estilo} />;
}

export {
    GRUPOS_CONTATOS,
    ORDEM_STATUS,
    STATUS_ORDENADOS_POR_DATA,
    ContactList,
    MENSAGEM_ERRO,
    MENSAGEM_VAZIA_ENVIADA,
    MENSAGEM_VAZIA_RECEBIDA,
    contatoEhValido,
    criarItensAgrupados,
    criarRotuloQuantidade,
    ordenarContatos
};
