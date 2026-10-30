//Apresenta a exclusão simples ou as decisões dos contatos vinculados.
import { useCallback, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import ButtonPopup from '../../../shared/components/common/Button/ButtonPopup';
import { BottomSheet } from '../../../shared/components/feedback/BottomSheet/BottomSheet';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { BottomSheetLayout } from '../../../shared/layouts/BottomSheet/BottomSheetLayout';
import { tema } from '../../../shared/theme';
import {
    ACOES_EXCLUSAO_CATEGORIA,
    acaoExclusaoEhValida
} from '../constants/categoryDeletionOptions';
import { CategoryContactDecisionItem } from './CategoryContactDecisionItem';
import { CategoryDecisionOption } from './CategoryDecisionOption';
import { estilos } from './DeleteSupportCategoryModal.styles';

function contatoEhValido(contato) {
    return (
        contato !== null &&
        typeof contato === 'object' &&
        !Array.isArray(contato) &&
        Number.isSafeInteger(contato.vinculoId) &&
        contato.vinculoId > 0 &&
        typeof contato.nome === 'string' &&
        contato.nome.trim().length > 0
    );
}

function obterDecisao(decisoes, vinculoId) {
    if (decisoes === null || typeof decisoes !== 'object' || Array.isArray(decisoes)) {
        return null;
    }

    const decisao = decisoes[vinculoId];

    return acaoExclusaoEhValida(decisao) ? decisao : null;
}

function DeleteSupportCategoryModal({
    visivel,
    categoria,
    contatos = [],
    decisoes = {},
    onAlterarDecisao,
    onAplicarATodos,
    onConfirmar,
    onCancelar,
    carregando = false
}) {
    const nomeCategoria =
        typeof categoria?.nome === 'string' && categoria.nome.trim().length > 0
            ? categoria.nome.trim()
            : 'esta categoria';

    const contatosRecebidos = useMemo(() => (Array.isArray(contatos) ? contatos : []), [contatos]);

    const contatosSeguros = useMemo(() => {
        const ids = new Set();

        return contatosRecebidos
            .filter((contato) => {
                if (!contatoEhValido(contato) || ids.has(contato.vinculoId)) {
                    return false;
                }

                ids.add(contato.vinculoId);

                return true;
            })
            .map((contato) => ({
                vinculoId: contato.vinculoId,
                nome: contato.nome.trim()
            }));
    }, [contatosRecebidos]);

    const possuiContatos = contatosRecebidos.length > 0;

    const contatosValidos = contatosSeguros.length === contatosRecebidos.length;

    const todasDecisoes = useMemo(
        () =>
            contatosSeguros.map((contato) => ({
                vinculoId: contato.vinculoId,
                acao: obterDecisao(decisoes, contato.vinculoId)
            })),
        [contatosSeguros, decisoes]
    );

    const todosPreenchidos =
        possuiContatos &&
        contatosValidos &&
        todasDecisoes.every((decisao) => acaoExclusaoEhValida(decisao.acao));

    const todosRemover =
        todosPreenchidos &&
        todasDecisoes.every((decisao) => decisao.acao === ACOES_EXCLUSAO_CATEGORIA.removerAcesso);

    const todosManter =
        todosPreenchidos &&
        todasDecisoes.every(
            (decisao) => decisao.acao === ACOES_EXCLUSAO_CATEGORIA.manterAcessoIndividual
        );

    const bloqueado = carregando || typeof onConfirmar !== 'function';

    const cancelar = useCallback(() => {
        if (!carregando && typeof onCancelar === 'function') {
            onCancelar();
        }
    }, [carregando, onCancelar]);

    const aplicarRemocaoATodos = useCallback(() => {
        if (!carregando && typeof onAplicarATodos === 'function') {
            onAplicarATodos(ACOES_EXCLUSAO_CATEGORIA.removerAcesso);
        }
    }, [carregando, onAplicarATodos]);

    const aplicarManutencaoATodos = useCallback(() => {
        if (!carregando && typeof onAplicarATodos === 'function') {
            onAplicarATodos(ACOES_EXCLUSAO_CATEGORIA.manterAcessoIndividual);
        }
    }, [carregando, onAplicarATodos]);

    const confirmarExclusaoSimples = useCallback(() => {
        if (!bloqueado) {
            onConfirmar([]);
        }
    }, [bloqueado, onConfirmar]);

    const confirmarExclusaoComContatos = useCallback(() => {
        if (bloqueado || !todosPreenchidos) {
            return;
        }

        onConfirmar(
            todasDecisoes.map((decisao) => ({
                vinculoId: decisao.vinculoId,
                acao: decisao.acao
            }))
        );
    }, [bloqueado, onConfirmar, todasDecisoes, todosPreenchidos]);

    if (!possuiContatos) {
        return (
            <SimpleModal
                visivel={Boolean(visivel)}
                aoFechar={cancelar}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Apagar categoria"
                mensagem={`Tem certeza que deseja excluir a categoria “${nomeCategoria}”? Esta ação não pode ser desfeita.`}
                acaoPrincipal={{
                    texto: 'Apagar',
                    variante: 'verde',
                    aoPressionar: confirmarExclusaoSimples,
                    carregando,
                    desativado: bloqueado
                }}
                acaoSecundaria={{
                    texto: 'Cancelar',
                    variante: 'branco',
                    aoPressionar: cancelar,
                    desativado: carregando
                }}
            />
        );
    }

    return (
        <BottomSheet visivel={Boolean(visivel)} onFechar={cancelar} bloquearFechamento={carregando}>
            <BottomSheetLayout
                titulo="Remover categoria"
                onFechar={cancelar}
                bloquearFechamento={carregando}
            >
                <View testID="modal-exclusao-com-contatos" style={estilos.container}>
                    <ScrollView
                        style={estilos.rolagem}
                        contentContainerStyle={estilos.conteudoRolagem}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={estilos.aplicarTodos}>
                            <Text style={estilos.tituloAplicar}>Aplicar uma decisão a todos</Text>

                            <Text style={estilos.descricaoAplicar}>
                                Escolha uma opção para aplicar a todos os contatos vinculados.
                            </Text>

                            <View style={estilos.opcoesAplicar}>
                                <CategoryDecisionOption
                                    titulo="Remover acesso de todos"
                                    descricao="Todos deixarão de visualizar seus dados."
                                    variante="remover"
                                    tipoIndicador="check"
                                    destacarFundo
                                    selecionado={todosRemover}
                                    aoPressionar={aplicarRemocaoATodos}
                                    desabilitado={
                                        carregando || typeof onAplicarATodos !== 'function'
                                    }
                                />

                                <CategoryDecisionOption
                                    titulo="Manter acesso de todos"
                                    descricao="Cada contato manterá as permissões de forma individual."
                                    variante="manter"
                                    tipoIndicador="check"
                                    destacarFundo
                                    selecionado={todosManter}
                                    aoPressionar={aplicarManutencaoATodos}
                                    desabilitado={
                                        carregando || typeof onAplicarATodos !== 'function'
                                    }
                                />
                            </View>
                        </View>

                        <View style={estilos.separador}>
                            <View style={estilos.linha} />

                            <Text style={estilos.textoSeparador}>OU PERSONALIZE POR CONTATO</Text>

                            <View style={estilos.linha} />
                        </View>

                        <View style={estilos.listaContatos}>
                            {contatosSeguros.map((contato) => (
                                <CategoryContactDecisionItem
                                    key={contato.vinculoId}
                                    contato={contato}
                                    decisao={obterDecisao(decisoes, contato.vinculoId)}
                                    onAlterarDecisao={onAlterarDecisao}
                                    desabilitado={carregando}
                                />
                            ))}
                        </View>
                    </ScrollView>

                    <View style={estilos.rodape}>
                        <ButtonPopup
                            texto="Confirmar exclusão"
                            aoPressionar={confirmarExclusaoComContatos}
                            variante="vermelho"
                            desativado={bloqueado || !todosPreenchidos}
                            carregando={carregando}
                            rotuloAcessibilidade="Confirmar exclusão da categoria"
                            estilo={estilos.botaoConfirmar}
                        />
                    </View>
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    );
}

export { DeleteSupportCategoryModal };
