//Carrega e apresenta as categorias de permissão da titular autenticada.
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
import {estilos} from './SupportCategoriesScreen.styles'

function SupportCategoriesScreen({
    service,
    onSessaoExpirada,
    onVoltar,
    onCriar,
    onEditar,
    onExcluir
}) {
    const estado =
        useSupportCategories({
            service,
            onSessaoExpirada
        })

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
                onEditar={onEditar}
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