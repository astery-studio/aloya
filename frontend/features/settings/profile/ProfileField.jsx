//Mostra uma informação do perfil e permite abrir sua edição.
import { Pressable, Text, View } from 'react-native'
import { NotePencilIcon } from 'phosphor-react-native/src/icons/NotePencil'
import { estilos, corIconeEditar } from './ProfileField.style'

function obterValorVisivel(valor) {
    if (typeof valor !== 'string' && typeof valor !== 'number') {
        return 'Não informado'
    }

    const texto = String(valor).trim()

    return texto || 'Não informado'
}

function ProfileField({label, valor, onPress, desabilitado = false}) {
    const estaDesabilitado = desabilitado || typeof onPress !== 'function'
    const valorVisivel = obterValorVisivel(valor)

    return (
        <Pressable
            onPress={onPress}
            disabled={estaDesabilitado}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${label}`}
            accessibilityHint="Abre a edição deste dado"
            accessibilityValue={{ text: valorVisivel }}
            accessibilityState={{ disabled: estaDesabilitado }}
            style={({ pressed }) => [
                estilos.container,
                pressed && !estaDesabilitado && estilos.pressionado,
                estaDesabilitado && estilos.desabilitado
            ]}
        >
            <View style={estilos.textos}>
                <Text style={estilos.label} numberOfLines={1}>{label}</Text>
                <Text style={estilos.valor} numberOfLines={1} ellipsizeMode="tail">{valorVisivel}</Text>
            </View>

            <NotePencilIcon size={20} color={corIconeEditar} weight="regular" />
        </Pressable>
    )
}

export { ProfileField }