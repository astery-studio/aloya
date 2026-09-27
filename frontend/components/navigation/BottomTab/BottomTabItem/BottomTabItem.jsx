//Mostra um item individual da navegação inferior
import { Pressable, Text, View } from 'react-native'
import { estilos, corAtiva, corInativa } from './BottomTabItem.style'

function BottomTabItem({ icone: Icone, label, ativo = false, onPress }) {
    const corDoItem = ativo ? corAtiva : corInativa

    return (
        <Pressable
            onPress={onPress}
            disabled={typeof onPress !== 'function'}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{
                selected: ativo,
                disabled: typeof onPress !== 'function'
            }}
            style={estilos.item}
        >
            <Icone
                size={26}
                color={corDoItem}
                weight={ativo ? 'fill' : 'regular'}
            />

            <Text
                numberOfLines={1}
                style={[
                    estilos.label,
                    ativo && estilos.labelAtiva
                ]}
            >
                {label}
            </Text>

            {ativo ? (
                <View style={estilos.pontoAtivo} />
            ) : null}
        </Pressable>
    )
}

export { BottomTabItem }