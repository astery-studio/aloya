import { Pressable, Text, View } from 'react-native'
import { estilos } from './Header.styles'

function Header({ titulo, onVoltar }) {
    return (
        <View style={estilos.container}>
            <View style={estilos.lateral}>
                {onVoltar ? (
                    <Pressable
                        onPress={onVoltar}
                        accessibilityRole="button"
                        accessibilityLabel="Voltar"
                        style={estilos.botaoVoltar}
                    >
                        <Text style={estilos.seta}>←</Text>
                    </Pressable>
                ) : null}
            </View>

            <Text
                style={estilos.titulo}
                numberOfLines={1}
                accessibilityRole="header"
            >
                {titulo}
            </Text>

            <View style={estilos.lateral} />
        </View>
    )
}

export { Header }