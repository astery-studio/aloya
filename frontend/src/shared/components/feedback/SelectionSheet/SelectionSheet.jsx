// Mostra opções disponíveis dentro de um BottomSheet.
import { useMemo } from 'react';
import { FlatList, Text } from 'react-native';

import { ButtonSelection } from '../../common/Button/ButtonSelection/ButtonSelection';
import { useTheme } from '../../../hooks/useTheme';
import { BottomSheetLayout } from '../../../layouts/BottomSheet/BottomSheetLayout';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { criarEstilos } from './SelectionSheet.style';

function obterChave(opcao) {
    return String(opcao.id);
}

function SelectionSheet({
    visivel,
    titulo,
    opcoes = [],
    valorSelecionado,
    onSelecionar,
    onFechar
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const selecaoDesabilitada = typeof onSelecionar !== 'function';

    function renderizarOpcao({ item }) {
        function selecionarOpcao() {
            onSelecionar?.(item.id);
        }

        return (
            <ButtonSelection
                label={item.label}
                descricao={item.descricao}
                icone={item.icone}
                selected={item.id === valorSelecionado}
                desabilitado={selecaoDesabilitada}
                onPress={selecionarOpcao}
            />
        );
    }

    return (
        <BottomSheet visivel={visivel} onFechar={onFechar}>
            <BottomSheetLayout titulo={titulo} onFechar={onFechar}>
                <FlatList
                    testID="selection-sheet-list"
                    data={Array.isArray(opcoes) ? opcoes : []}
                    renderItem={renderizarOpcao}
                    keyExtractor={obterChave}
                    extraData={valorSelecionado}
                    initialNumToRender={7}
                    windowSize={5}
                    style={estilos.lista}
                    contentContainerStyle={estilos.conteudoLista}
                    ListEmptyComponent={
                        <Text style={estilos.mensagemVazia}>Nenhuma opção disponível.</Text>
                    }
                />
            </BottomSheetLayout>
        </BottomSheet>
    );
}

export { SelectionSheet, obterChave };
