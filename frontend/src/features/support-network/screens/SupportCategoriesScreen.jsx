//Compõe o cabeçalho e a listagem das categorias de permissão.
import {
    SafeAreaView
} from 'react-native-safe-area-context'

import {
    Header
} from '../../../shared/components/navigation/Header/Header'
import {
    SupportCategoryList
} from '../components/SupportCategoryList'
import {estilos} from './SupportCategoriesScreen.styles'

function SupportCategoriesScreen({
    categorias = [],
    carregando = false,
    atualizando = false,
    erro = null,
    categoriaEmAndamentoId = null,
    acaoEmAndamento = null,
    desabilitado = false,
    onVoltar,
    onEditar,
    onExcluir,
    onCriar,
    onTentarNovamente
}) {
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
                categorias={categorias}
                carregando={carregando}
                atualizando={atualizando}
                erro={erro}
                categoriaEmAndamentoId={
                    categoriaEmAndamentoId
                }
                acaoEmAndamento={
                    acaoEmAndamento
                }
                desabilitado={
                    desabilitado
                }
                onEditar={onEditar}
                onExcluir={onExcluir}
                onCriar={onCriar}
                onTentarNovamente={
                    onTentarNovamente
                }
            />
        </SafeAreaView>
    )
}

export {SupportCategoriesScreen}