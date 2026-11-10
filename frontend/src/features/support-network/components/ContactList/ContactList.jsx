//Apresenta contatos pendentes e ativos em uma lista virtualizada.
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useCallback, useMemo } from 'react';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { EmptyState } from '../../../../shared/components/feedback/EmptyState/EmptyState';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilosErro } from '../../../../shared/theme/errorStateStyles';
import { ContactCard } from '../ContactCard/ContactCard';
import { criarEstilos } from './ContactList.styles';

const MENSAGEM_ERRO = 'Não foi possível carregar sua Rede de Apoio no momento. Tente novamente.';

const MENSAGEM_VAZIA_ENVIADA =
    "Você ainda não adicionou nenhum contato à sua Rede de Apoio. Toque em 'Adicionar novo contato' para convidar alguém de confiança.";

const MENSAGEM_VAZIA_RECEBIDA =
    'Você ainda não recebeu nenhum convite para participar de uma Rede de Apoio.';

const ORDEM_STATUS = Object.freeze({
    pendente: 0,
    ativo: 1
});

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

function criarItensAgrupados(contatos) {
    const contatosOrdenados = ordenarContatos(contatos);

    const grupos = [
        {
            status: 'pendente',
            titulo: 'CONVITES'
        },
        {
            status: 'ativo',
            titulo: 'CONTATOS ATIVOS'
        }
    ];

    return grupos.flatMap((grupo) => {
        const itensDoGrupo = contatosOrdenados.filter((contato) => contato.status === grupo.status);

        if (itensDoGrupo.length === 0) {
            return [];
        }

        return [
            {
                tipo: 'cabecalho',
                id: `cabecalho-${grupo.status}`,
                titulo: grupo.titulo,
                quantidade: itensDoGrupo.length
            },
            ...itensDoGrupo.map((contato) => ({
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
    aoAbrirResumo,
    aoTentarNovamente,
    contatoEmAndamentoId = null,
    acaoEmAndamento = null,
    desabilitado = false,
    cabecalho = null
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const estilosErro = useMemo(() => criarEstilosErro(tema), [tema]);

    const itens = useMemo(() => criarItensAgrupados(contatos), [contatos]);

    const possuiContatos = itens.some((item) => item.tipo === 'contato');

    const carregamentoInicial = carregando && !possuiContatos;

    const erroInicial = Boolean(erro) && !possuiContatos;

    const estadoSemResultado =
        !carregamentoInicial && !erroInicial && !possuiContatos && filtroAtivo;

    const estadoVazio = !carregamentoInicial && !erroInicial && !possuiContatos && !filtroAtivo;

    const renderizarItem = useCallback(
        ({ item }) => {
            if (item.tipo === 'cabecalho') {
                return (
                    <View
                        accessibilityRole="header"
                        accessibilityLabel={`${item.titulo}, ${criarRotuloQuantidade(item.quantidade)}`}
                        style={estilos.cabecalhoGrupo}
                    >
                        <View style={estilos.linhaGrupo} />

                        <Text style={estilos.tituloGrupo}>
                            {item.titulo} ({criarRotuloQuantidade(item.quantidade)})
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
            contatoEmAndamentoId,
            desabilitado,
            estilos,
            perspectiva
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
                <ActivityIndicator color={tema.cores.interface.destaque} size="small" />

                <Text style={estilos.textoAtualizacao}>Atualizando contatos...</Text>
            </View>
        );
    }, [atualizando, estilos, tema.cores.interface.destaque]);

    const renderizarCabecalho = useCallback(
        () => (
            <>
                {cabecalho}
                {renderizarAtualizacao()}
            </>
        ),
        [cabecalho, renderizarAtualizacao]
    );

    if (carregamentoInicial) {
        return (
            <View
                testID="contact-list-loading"
                accessibilityLabel="Carregando contatos"
                accessibilityLiveRegion="polite"
                style={estilos.estadoCentral}
            >
                <ActivityIndicator color={tema.cores.interface.destaque} size="large" />

                <Text style={estilos.textoCarregamento}>Carregando contatos...</Text>
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
                            estilo={estilosErro.botao}
                            estiloTexto={estilosErro.textoBotao}
                            texto="Tentar Novamente"
                            aoPressionar={aoTentarNovamente}
                            variante="preto"
                            desativado={desabilitado}
                        />
                    }
                />
            </View>
        );
    }

    if (estadoSemResultado) {
        return (
            <View style={estilos.estadoCentral}>
                <EmptyState
                    titulo="Nenhum contato encontrado"
                    mensagem="Nenhum contato corresponde aos filtros selecionados."
                    variante="vazio"
                />
            </View>
        );
    }

    if (estadoVazio) {
        const recebido = perspectiva === 'recebido';

        return (
            <View style={estilos.estadoCentral}>
                <EmptyState
                    titulo={recebido ? 'Nenhum convite recebido' : 'Nenhum contato adicionado'}
                    mensagem={recebido ? MENSAGEM_VAZIA_RECEBIDA : MENSAGEM_VAZIA_ENVIADA}
                    variante="vazio"
                />
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
    ContactList,
    MENSAGEM_ERRO,
    MENSAGEM_VAZIA_ENVIADA,
    MENSAGEM_VAZIA_RECEBIDA,
    contatoEhValido,
    criarItensAgrupados,
    criarRotuloQuantidade,
    ordenarContatos
};
