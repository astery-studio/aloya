import {Pressable, Text, View} from 'react-native'
import { ArrowLeftIcon } from '../../icons/AppIcons'
import {estilos, corIconeVoltar} from './Header.style'

function Header({titulo, variante = 'padrao', onVoltar, usarEspacamentoSuperior = true}) {
    const temVoltar =
        variante === 'comVoltar'

    return (
        <View style={estilos.container}>
            {usarEspacamentoSuperior ? (
                <View
                    testID="espacamento-superior-header"
                    style={[
                        estilos.espacamentoSuperior,
                        temVoltar
                            && estilos.espacamentoSuperiorComVoltar
                    ]}
                />
            ) : null}

            <View
                style={[
                    estilos.areaTitulo,
                    temVoltar
                        && estilos.areaTituloComVoltar
                ]}
            >
                {temVoltar ? (
                    <Pressable
                        onPress={onVoltar}
                        disabled={
                            typeof onVoltar
                            !== 'function'
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Voltar"
                        accessibilityState={{
                            disabled:
                                typeof onVoltar
                                !== 'function'
                        }}
                        style={
                            estilos.containerVoltar
                        }
                    >
                        <ArrowLeftIcon
                            size={24}
                            color={corIconeVoltar}
                            weight="regular"
                        />
                    </Pressable>
                ) : null}

                <Text
                    style={[
                        estilos.titulo,
                        temVoltar
                            && estilos.tituloComVoltar
                    ]}
                    accessibilityRole="header"
                >
                    {titulo}
                </Text>
            </View>
        </View>
    )
}

export {
    Header
}