//Organiza título, alça ou botão de fechar dentro do painel. É usado por SelectionSheet e EditFieldSheet.

import { Pressable, Text, View } from 'react-native'
import { XIcon } from 'phosphor-react-native/src/icons/X'
import { estilos, corIconeFechar } from './BottomSheetLayout.style'

function BottomSheetLayout({
    titulo,
    cabecalho = 'alca',
    onFechar,
    children
}) {
    const mostraBotaoFechar =
        cabecalho === 'fechar'

    return (
        <View style={estilos.container}>
            {mostraBotaoFechar ? (
                <View style={estilos.cabecalhoComFechar}>
                    <Text style={estilos.tituloEsquerda}>
                        {titulo}
                    </Text>

                    <Pressable
                        onPress={onFechar}
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
            ) : (
                <View style={estilos.cabecalhoComAlca}>
                    <View style={estilos.alca} />

                    <Text style={estilos.tituloCentral}>
                        {titulo}
                    </Text>
                </View>
            )}

            <View style={estilos.conteudo}>
                {children}
            </View>
        </View>
    )
}

export { BottomSheetLayout }