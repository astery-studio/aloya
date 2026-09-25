//Mostra opções disponíveis dentro de um BottomSheet
import { FlatList, Text } from 'react-native'
import { estilos } from './SelectionSheet.style'
import { BottomSheet } from '../Bottomsheet/BottomSheet'
import { BottomSheetLayout } from '../../../layouts/BottomSheet/BottomSheetLayout'
import { ButtonSelection } from '../../common/Button/ButtonSelection/ButtonSelection'

function obterChave(opcao) {
    return String(opcao.id)
}

function SelectionSheet({visivel, titulo, opcoes = [], valorSelecionado, onSelecionar, onFechar, variante = 'padrao' }) {
    function renderizarOpcao({ item }) {
        function selecionarOpcao() {
            onSelecionar(item.id)
        }

        return (
            <ButtonSelection
                label={item.label}
                descricao={item.descricao}
                icone={item.icone}
                selected={item.id === valorSelecionado}
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
                variante={variante}
            >
                <FlatList
                    data={opcoes}
                    renderItem={renderizarOpcao}
                    keyExtractor={obterChave}
                    extraData={valorSelecionado}
                    initialNumToRender={7}
                    windowSize={5}
                    style={estilos.lista}
                    contentContainerStyle={[estilos.conteudoLista, variante === 'anticoncepcional' && estilos.conteudoListaAnticoncepcional]}
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
