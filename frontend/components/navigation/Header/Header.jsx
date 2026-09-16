import { Pressable, Text, View } from 'react-native'
import { estilos, corIconeVoltar } from './Header.style'
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

                        <ArrowLeftIcon
                            size={24}
                            color={corIconeVoltar}
                            weight="regular"
                        />

                    </Pressable>
                ) : null}

                {temVoltar ? (
                    <View style={estilos.espacamentoFinal} />
                ) : null}

                {temVoltar ? (
                    <View style={estilos.espacamentoInicial} />
                ) : null}

                <Text
                    style={[
                        estilos.titulo,
                        temVoltar && estilos.tituloComVoltar
                    ]}
                    accessibilityRole="header"
                >
                    {titulo}
                </Text>
            </View>
        </View>
    )
}

export { Header }