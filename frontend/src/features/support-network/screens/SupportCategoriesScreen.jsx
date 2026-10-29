// Carrega, apresenta e coordena edição e exclusão das categorias de permissão.
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { BellIcon, WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { tema } from '../../../shared/theme';
import { DeleteSupportCategoryModal } from '../components/DeleteSupportCategoryModal';
import { SupportCategoryList } from '../components/SupportCategoryList';
import { useDeleteSupportCategory } from '../hooks/useDeleteSupportCategory';
import { useSupportCategories } from '../hooks/useSupportCategories';
import { EditSupportCategoryScreen } from './EditSupportCategoryScreen';
import { estilos } from './SupportCategoriesScreen.styles';

function criarListaDecisoes(impacto, decisoes) {
    if (!Array.isArray(impacto?.contatos)) {
        return [];
    }

    return impacto.contatos.map((contato) => ({
        vinculoId: contato.vinculoId,
        acao: decisoes[contato.vinculoId] ?? null
    }));
}

function SupportCategoriesScreen({
    service,
    onSessaoExpirada,
    onVoltar,
    onCriar,
    onEditar,
    onExcluir
}) {
    const [categoriaEmEdicao, definirCategoriaEmEdicao] = useState(null);

    const estado = useSupportCategories({
        service,
        onSessaoExpirada
    });

    const { atualizarCategoria, removerCategoria } = estado;

    const receberCategoriaExcluida = useCallback(
        (categoriaId) => {
            removerCategoria(categoriaId);
        },
        [removerCategoria]
    );

    const exclusao = useDeleteSupportCategory({
        service,
        onCategoriaExcluida: receberCategoriaExcluida,
        onSessaoExpirada
    });

    const edicaoIntegradaDisponivel =
        typeof service?.editarCategoria === 'function';

    const exclusaoIntegradaDisponivel =
        typeof service?.consultarImpactoExclusao === 'function'
        && typeof service?.excluirCategoria === 'function';

    // Abre a edição integrada quando o serviço está disponível.
    const editarCategoria = useCallback(
        (categoria) => {
            if (edicaoIntegradaDisponivel) {
                definirCategoriaEmEdicao(categoria);
                return;
            }

            onEditar?.(categoria);
        },
        [
            edicaoIntegradaDisponivel,
            onEditar
        ]
    );

    // Consulta o impacto antes de apresentar a confirmação de exclusão.
    const excluirCategoria = useCallback(
        (categoria) => {
            if (exclusaoIntegradaDisponivel) {
                void exclusao.solicitarExclusao(categoria);
                return;
            }

            onExcluir?.(categoria);
        },
        [
            exclusao,
            exclusaoIntegradaDisponivel,
            onExcluir
        ]
    );

    // Substitui a categoria na coleção visível sem recarregar a listagem.
    const receberCategoriaAtualizada = useCallback(
        (categoria) => {
            atualizarCategoria(categoria);
            definirCategoriaEmEdicao(categoria);
        },
        [atualizarCategoria]
    );

    const fecharEdicao = useCallback(() => {
        definirCategoriaEmEdicao(null);
    }, []);

    // Repete a operação adequada sem perder as decisões preenchidas.
    const tentarNovamenteExclusao = useCallback(() => {
        if (
            exclusao.erro?.codigo === 'IMPACTO_EXCLUSAO_ALTERADO'
            || exclusao.impacto === null
        ) {
            return exclusao.tentarNovamente();
        }

        return exclusao.confirmarExclusao(
            criarListaDecisoes(
                exclusao.impacto,
                exclusao.decisoes
            )
        );
    }, [exclusao]);

    if (
        categoriaEmEdicao !== null
        && edicaoIntegradaDisponivel
    ) {
        return (
            <EditSupportCategoryScreen
                categoria={categoriaEmEdicao}
                editarCategoria={service.editarCategoria}
                onVoltar={fecharEdicao}
                onCategoriaAtualizada={receberCategoriaAtualizada}
                onConcluido={fecharEdicao}
                onSessaoExpirada={onSessaoExpirada}
            />
        );
    }

    const operacaoExclusaoEmAndamento =
        exclusao.carregandoImpacto
        || exclusao.excluindo;

    return (
        <>
            <SafeAreaView
                testID="support-categories-screen"
                edges={['bottom']}
                style={estilos.tela}
            >
                <Header
                    titulo="Categorias de Permissão"
                    variante="comVoltar"
                    onVoltar={onVoltar}
                />

                <SupportCategoryList
                    categorias={estado.categorias}
                    carregando={estado.carregando}
                    atualizando={estado.atualizando}
                    erro={estado.erro}
                    onEditar={editarCategoria}
                    onExcluir={excluirCategoria}
                    onCriar={onCriar}
                    onTentarNovamente={estado.tentarNovamente}
                    categoriaEmAndamentoId={
                        operacaoExclusaoEmAndamento
                            ? exclusao.categoria?.id
                            : null
                    }
                    acaoEmAndamento={
                        operacaoExclusaoEmAndamento
                            ? 'excluir'
                            : null
                    }
                    desabilitado={exclusao.excluindo}
                />
            </SafeAreaView>

            <DeleteSupportCategoryModal
                visivel={exclusao.modalVisivel}
                categoria={exclusao.categoria}
                contatos={exclusao.impacto?.contatos ?? []}
                decisoes={exclusao.decisoes}
                onAlterarDecisao={exclusao.alterarDecisao}
                onAplicarATodos={exclusao.aplicarATodos}
                onConfirmar={exclusao.confirmarExclusao}
                onCancelar={exclusao.cancelar}
                carregando={exclusao.excluindo}
            />

            <SimpleModal
                visivel={exclusao.erro !== null}
                aoFechar={exclusao.fecharErro}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={
                    tema.cores.icones
                        .configuracoes
                        .laranja.caixa
                }
                titulo="Ocorreu um erro"
                mensagem={exclusao.erro?.mensagem}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: tentarNovamenteExclusao,
                    carregando: operacaoExclusaoEmAndamento
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: exclusao.fecharErro,
                    desativado: operacaoExclusaoEmAndamento
                }}
            />

            <SimpleModal
                visivel={exclusao.sucesso}
                aoFechar={exclusao.concluirSucesso}
                icone={BellIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={
                    tema.cores.icones
                        .configuracoes
                        .laranja.caixa
                }
                titulo="Categoria excluída com sucesso."
                acaoPrincipal={{
                    texto: 'OK',
                    variante: 'verde',
                    aoPressionar: exclusao.concluirSucesso
                }}
            />
        </>
    );
}

export { SupportCategoriesScreen };