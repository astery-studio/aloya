//Carrega, apresenta e coordena a edição das categorias de permissão.
import {
    useCallback,
    useState
} from 'react'
import {
    SafeAreaView
} from 'react-native-safe-area-context'

import {
    Header
} from '../../../shared/components/navigation/Header/Header'
import {
    SupportCategoryList
} from '../components/SupportCategoryList'
import {
    useSupportCategories
} from '../hooks/useSupportCategories'
import {
    EditSupportCategoryScreen
} from './EditSupportCategoryScreen'
import {estilos} from './SupportCategoriesScreen.styles'

function SupportCategoriesScreen({
    service,
    onSessaoExpirada,
    onVoltar,
    onCriar,
    onEditar,
    onExcluir
}) {
    const [
        categoriaEmEdicao,
        definirCategoriaEmEdicao
    ] = useState(null)

    const estado =
        useSupportCategories({
            service,
            onSessaoExpirada
        })

    const edicaoIntegradaDisponivel =
        typeof service?.editarCategoria
            === 'function'

    //Abre a edição integrada quando o serviço está disponível e preserva compatibilidade externa.
    const editarCategoria =
        useCallback(categoria => {
            if (
                edicaoIntegradaDisponivel
            ) {
                definirCategoriaEmEdicao(
                    categoria
                )
                return
            }

            onEditar?.(categoria)
        }, [
            edicaoIntegradaDisponivel,
            onEditar
        ])

    //Substitui a categoria na coleção visível sem recarregar a listagem.
    const receberCategoriaAtualizada =
        useCallback(categoria => {
            estado.atualizarCategoria(
                categoria
            )

            definirCategoriaEmEdicao(
                categoria
            )
        }, [
            estado.atualizarCategoria
        ])

    const fecharEdicao =
        useCallback(() => {
            definirCategoriaEmEdicao(
                null
            )
        }, [])

    if (
        categoriaEmEdicao !== null
        && edicaoIntegradaDisponivel
    ) {
        return (
            <EditSupportCategoryScreen
                categoria={
                    categoriaEmEdicao
                }
                editarCategoria={
                    service.editarCategoria
                }
                onVoltar={fecharEdicao}
                onCategoriaAtualizada={
                    receberCategoriaAtualizada
                }
                onConcluido={
                    fecharEdicao
                }
                onSessaoExpirada={
                    onSessaoExpirada
                }
            />
        )
    }

    return (
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
                categorias={
                    estado.categorias
                }
                carregando={
                    estado.carregando
                }
                atualizando={
                    estado.atualizando
                }
                erro={estado.erro}
                onEditar={
                    editarCategoria
                }
                onExcluir={onExcluir}
                onCriar={onCriar}
                onTentarNovamente={
                    estado.tentarNovamente
                }
            />
        </SafeAreaView>
    )
}

export {SupportCategoriesScreen}