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
    onFechar,
    varianteOpcao = 'lista',
    corFundo,
    estiloPainel,
    estiloOpcaoSelecionada,
    estiloTextoOpcaoSelecionada
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const corDoFundo = corFundo ?? (tema.escuro ? '#242424' : undefined);
    const selecaoDesabilitada = typeof onSelecionar !== 'function';

    function renderizarOpcao({ item }) {
        function selecionarOpcao() {
            onSelecionar?.(item.id);
        }

        return (
            <ButtonSelection
                label={item.label}
                estiloTexto={estilos.textoOpcao}
                estiloDescricao={estilos.textoOpcao}
                estiloSelecionado={estiloOpcaoSelecionada}
                estiloTextoSelecionado={estiloTextoOpcaoSelecionada}
                descricao={item.descricao}
                icone={item.icone}
                selected={item.id === valorSelecionado}
                desabilitado={selecaoDesabilitada}
                variante={varianteOpcao}
                onPress={selecionarOpcao}
            />
        );
    }

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            corPainel={corDoFundo}
            estiloPainel={[estilos.painel, estiloPainel]}
        >
            <BottomSheetLayout
                titulo={titulo}
                onFechar={onFechar}
                corFundo={corDoFundo}
                estiloTitulo={estilos.textoOpcao}
            >
                <FlatList
                    testID="selection-sheet-list"
                    data={Array.isArray(opcoes) ? opcoes : []}
                    renderItem={renderizarOpcao}
                    keyExtractor={obterChave}
                    extraData={valorSelecionado}
                    initialNumToRender={7}
                    windowSize={5}
                    style={[estilos.lista, corDoFundo ? { backgroundColor: corDoFundo } : null]}
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
