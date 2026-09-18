/**
 * Organiza o cabeçalho e o conteúdo dos painéis inferiores.
 * É usado por SelectionSheet e EditFieldSheet.
 * Existe para manter o mesmo título e botão X em todos os painéis.
 */

import { Pressable, Text, View } from 'react-native'
import { XIcon } from 'phosphor-react-native/src/icons/X'

import {
    estilos,
    corIconeFechar
} from './BottomSheetLayout.style'

/**
 * Recebe título, conteúdo, ação de fechar e estado de salvamento.
 * Mostra o cabeçalho padrão com título à esquerda e X à direita.
 * Retorna a organização interna do painel.
 */
function BottomSheetLayout({
    titulo,
    onFechar,
    bloquearFechamento = false,
    children
}) {
    /**
     * Não recebe dados.
     * Fecha o painel pelo X quando não está salvando.
     * Não retorna valor.
     */
    function fecharPeloX() {
        if (!bloquearFechamento) {
            onFechar?.()
        }
    }

    return (
        <View style={estilos.container}>
            <View style={estilos.cabecalho}>
                <Text style={estilos.titulo}>
                    {titulo}
                </Text>

                <Pressable
                    onPress={fecharPeloX}
                    disabled={bloquearFechamento}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar painel"
                    style={estilos.botaoFechar}
                >
                    <XIcon
                        size={24}
                        color={corIconeFechar}
                        weight="regular"
                    />
                </Pressable>
            </View>

            <View style={estilos.conteudo}>
                {children}
            </View>
        </View>
    )
}

export { BottomSheetLayout }