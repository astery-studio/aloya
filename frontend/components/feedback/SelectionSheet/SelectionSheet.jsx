/**
 * Mostra opções disponíveis dentro de um BottomSheet.
 * É usado, por exemplo, para identidade de gênero.
 * Existe para reutilizar a mesma seleção em diferentes situações.
 */

import { FlatList, Text } from 'react-native'

import { estilos } from './SelectionSheet.style'
import { BottomSheet } from '../Bottomsheet/BottomSheet'
import { BottomSheetLayout } from '../../../layouts/BottomSheet/BottomSheetLayout'
import { ButtonSelection } from '../../common/Button/ButtonSelection/ButtonSelection'

/**
 * Recebe uma opção.
 * Transforma seu id em texto para identificar a linha da lista.
 * Retorna a chave da opção.
 */
function obterChave(opcao) {
    return String(opcao.id)
}

/**
 * Recebe título, opções e ações da tela.
 * Mostra a lista com o cabeçalho padrão e X.
 * Retorna o painel de seleção.
 */
function SelectionSheet({
    visivel,
    titulo,
    opcoes = [],
    valorSelecionado,
    onSelecionar,
    onFechar
}) {
    /**
     * Recebe uma opção da lista.
     * Mostra o botão correspondente e seu estado selecionado.
     * Retorna a linha da opção.
     */
    function renderizarOpcao({ item }) {
        /**
         * Não recebe dados.
         * Informa à tela qual opção foi escolhida.
         * Não retorna valor.
         */
        function selecionarOpcao() {
            onSelecionar(item.id)
        }

        return (
            <ButtonSelection
                label={item.label}
                descricao={item.descricao}
                icone={item.icone}
                selected={
                    item.id === valorSelecionado
                }
                onPress={selecionarOpcao}
            />
        )
    }

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
        >
            <BottomSheetLayout
                titulo={titulo}
                onFechar={onFechar}
            >
                <FlatList
                    data={opcoes}
                    renderItem={renderizarOpcao}
                    keyExtractor={obterChave}
                    extraData={valorSelecionado}
                    initialNumToRender={7}
                    windowSize={5}
                    style={estilos.lista}
                    contentContainerStyle={
                        estilos.conteudoLista
                    }
                    ListEmptyComponent={
                        <Text style={estilos.mensagemVazia}>
                            Nenhuma opção disponível.
                        </Text>
                    }
                />
            </BottomSheetLayout>
        </BottomSheet>
    )
}

export { SelectionSheet }