//Mostra uma permissão que pode ser ligada ou desligada pela pessoa usuária.
import {memo, useCallback, useEffect, useRef} from 'react'
import {Animated, Easing, Pressable, Text, View} from 'react-native'
import {estilos} from './SwitchField.styles'

//Recebe o estado atual, anima o indicador e informa o novo valor ao componente pai.
function SwitchField({titulo, ativo = false, aoAlterar, desabilitado = false, estilo}) {
    const estaAtivo = ativo === true
    const estaDesabilitado = desabilitado || typeof aoAlterar !== 'function'
    const deslocamento = useRef(new Animated.Value(estaAtivo ? 20 : 0)).current

    useEffect(() => {
        const animacao = Animated.timing(deslocamento, {
            toValue: estaAtivo ? 20 : 0,
            duration: 160,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
        })

        animacao.start()

        return () => animacao.stop()
    }, [deslocamento, estaAtivo])

    //Inverte o estado atual e devolve o novo valor ao componente que controla a permissão.
    const alternar = useCallback(() => {
        if (!estaDesabilitado) {
            aoAlterar(!estaAtivo)
        }
    }, [aoAlterar, estaAtivo, estaDesabilitado])

    return (
        <Pressable
            onPress={alternar}
            disabled={estaDesabilitado}
            accessibilityRole="switch"
            accessibilityLabel={titulo}
            accessibilityHint="Ativa ou desativa esta permissão"
            accessibilityState={{
                checked: estaAtivo,
                disabled: estaDesabilitado
            }}
            style={({pressed}) => [
                estilos.container,
                pressed && !estaDesabilitado && estilos.pressionado,
                estaDesabilitado && estilos.desabilitado,
                estilo
            ]}
        >
            <Text style={estilos.titulo} numberOfLines={2}>
                {titulo}
            </Text>

            <View style={[estilos.trilha, estaAtivo ? estilos.trilhaAtiva : estilos.trilhaInativa]} pointerEvents="none">
                <Animated.View
                    style={[
                        estilos.indicador,
                        {
                            transform: [
                                {
                                    translateX: deslocamento
                                }
                            ]
                        }
                    ]}
                />
            </View>
        </Pressable>
    )
}

export default memo(SwitchField)