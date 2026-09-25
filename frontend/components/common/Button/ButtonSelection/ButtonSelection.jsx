//Mostra uma opção que pode ser selecionada. É usado nas listas de SelectionSheet.
import { Pressable, Text, View } from 'react-native'
import { CheckCircle } from 'phosphor-react-native'
import { estilos, corIconeNormal, corIconeSelecionado } from './ButtonSelection.style'

function ButtonSelection({ label, selected = false, onPress, icone: Icone, descricao, desabilitado = false, variante = 'lista' }) {
    const intensidade = variante === 'intensidade'
    return (
        <Pressable
            onPress={onPress}
            disabled={desabilitado}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: desabilitado }}
            style={[
                estilos.container,
                intensidade && estilos.intensidade,
                selected && estilos.selecionado,
                intensidade && selected && estilos.intensidadeSelecionada,
                desabilitado && estilos.desabilitado
            ]}
        >
            {Icone ? (
                <Icone
                    size={24}
                    color={selected ? corIconeSelecionado : corIconeNormal}
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
            {intensidade ? (selected ? <CheckCircle size={26} weight="fill" color={corIconeSelecionado} /> : <View style={estilos.radioVazio} />) : null}
        </Pressable>
    )
}

export { ButtonSelection }
