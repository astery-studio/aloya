import { Pressable, Text, View } from 'react-native'
import { estilos } from './Header.style'
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft'

function Header({ titulo, variante = 'padrao', onVoltar}) {
    const temVoltar = variante === 'comVoltar'

    return (
        <View style={estilos.container}>
            <View style={estilos.espacamentoSuperior} />

            <View style={[
                estilos.areaTitulo,
                temVoltar && estilos.areaTituloComVoltar
            ]}>
                <Text
                    style={estilos.titulo}
                    numberOfLines={1}
                    accessibilityRole="header"
                >
                    {titulo}
                </Text>

                {temVoltar ? (
                    <Pressable
                        onPress={onVoltar}
                        disabled={typeof onVoltar !== 'function'}
                        accessibilityRole="button"
                        accessibilityLabel="Voltar"
                        accessibilityState={{
                            disabled: typeof onVoltar !== 'function'
                        }}
                        style={estilos.containerVoltar}
                    >

                        <ArrowLeftIcon style={estilos.iconeVoltar} />

                    </Pressable>
                ) : null}

                {temVoltar ? (
                    <View style={estilos.espacamentoFinal} />
                ) : null}
            </View>
        </View>
    )
}

export { Header }