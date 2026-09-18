//Mostra uma lista de opções dentro de um BottomSheet

import { FlatList, Text } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { BottomSheetLayout } from '../../layouts/BottomSheetLayout'
import { ButtonSelection } from '../common/ButtonSelection'
import { estilos } from './SelectionSheet.style'

function obterChave(opcao) {
    return String(opcao.id)
}

function SelectionSheet({
    visivel,
    titulo,
    cabecalho = 'fechar',
    opcoes = [],
    valorSelecionado,
    onSelecionar,
    onFechar
}) {
    function renderizarOpcao({ item }) {
        
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
                cabecalho={cabecalho}
                onFechar={onFechar}
            >
                <FlatList
                    data={opcoes}
                    renderItem={renderizarOpcao}
                    keyExtractor={obterChave}
                    extraData={valorSelecionado}
                    initialNumToRender={7}
                    windowSize={5}
                    style={[
                        estilos.lista,
                        cabecalho === 'fechar'
                            && estilos.listaLarga
                    ]}
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