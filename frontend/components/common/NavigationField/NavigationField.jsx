//Mostra uma linha que abre outra tela ou painel.
import { Pressable, Text, View } from 'react-native'
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight'

import { tema } from '../../../theme'
import { estilos, corSeta } from './NavigationField.style'

const coresDosTons = {
    verde: tema.cores.marca.secundaria,
    coral: tema.cores.marca.primaria,
    azul: tema.cores.feedback.informacao
}

function NavigationField({ label, icone: Icone, onPress, variante = 'comBorda', tom = 'verde', desabilitado = false }) {
    const corIcone = coresDosTons[tom] ?? coresDosTons.verde
    const semBorda = variante === 'semBorda'
    const estaDesabilitado = desabilitado || typeof onPress !== 'function'

    return (
        <Pressable
            onPress={onPress}
            disabled={estaDesabilitado}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint="Abre outra tela ou painel"
            accessibilityState={{
                disabled: estaDesabilitado
            }}
            style={[
                estilos.container,
                semBorda && estilos.semBorda,
                estaDesabilitado && estilos.desabilitado
            ]}
        >
            {Icone ? (
                <View
                    style={[
                        estilos.caixaIcone,
                        {
                            backgroundColor: `${corIcone}12`
                        }
                    ]}
                >
                    <Icone
                        size={24}
                        color={corIcone}
                        weight="regular"
                    />
                </View>
            ) : null}

            <Text
                style={estilos.label}
                numberOfLines={2}
            >
                {label}
            </Text>

            <CaretRightIcon
                size={20}
                color={corSeta}
                weight="regular"
            />
        </Pressable>
    )
}

export { NavigationField }