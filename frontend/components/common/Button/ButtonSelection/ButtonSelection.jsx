//Mostra uma opção que pode ser selecionada. É usado nas listas de SelectionSheet.

import { Pressable, Text, View } from 'react-native'
import { estilos, corIconeNormal, corIconeSelecionado } from './ButtonSelection.style'

function ButtonSelection({
    label,
    selected = false,
    onPress,
    icone: Icone,
    descricao,
    desabilitado = false
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={desabilitado}
            accessibilityRole="button"
            accessibilityState={{
                selected,
                disabled: desabilitado
            }}
            style={[
                estilos.container,
                selected && estilos.selecionado,
                desabilitado && estilos.desabilitado
            ]}
        >
            {Icone ? (
                <Icone
                    size={24}
                    color={
                        selected
                            ? corIconeSelecionado
                            : corIconeNormal
                    }
                />
            ) : null}

            <View style={estilos.textos}>
                <Text
                    style={[
                        estilos.label,
                        selected && estilos.labelSelecionado
                    ]}
                >
                    {label}
                </Text>

                {descricao ? (
                    <Text style={estilos.descricao}>
                        {descricao}
                    </Text>
                ) : null}
            </View>
        </Pressable>
    )
}

export { ButtonSelection }