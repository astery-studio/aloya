//Representa uma decisão selecionável de remover ou manter o acesso de um contato.
import {
    Pressable,
    Text,
    View
} from 'react-native'

import {estilos} from './CategoryDecisionOption.styles'

function CategoryDecisionOption({
    titulo,
    selecionado = false,
    variante = 'manter',
    aoPressionar,
    desabilitado = false,
    rotuloAcessibilidade
}) {
    const perigo =
        variante === 'remover'

    const bloqueado =
        desabilitado
        || typeof aoPressionar
            !== 'function'

    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityLabel={
                rotuloAcessibilidade
                || titulo
            }
            accessibilityState={{
                checked: selecionado,
                disabled: bloqueado
            }}
            disabled={bloqueado}
            onPress={aoPressionar}
            style={({pressed}) => [
                estilos.opcao,
                selecionado
                && (
                    perigo
                        ? estilos
                            .opcaoSelecionadaPerigo
                        : estilos
                            .opcaoSelecionadaManter
                ),
                pressed
                && !bloqueado
                && estilos.pressionada,
                bloqueado
                && estilos.desabilitada
            ]}
        >
            <View
                testID={
                    perigo
                        ? 'indicador-remover'
                        : 'indicador-manter'
                }
                style={[
                    estilos.indicador,
                    selecionado
                    && (
                        perigo
                            ? estilos
                                .indicadorPerigo
                            : estilos
                                .indicadorManter
                    )
                ]}
            >
                {selecionado ? (
                    <View
                        style={
                            estilos
                                .centroIndicador
                        }
                    />
                ) : null}
            </View>

            <Text
                numberOfLines={3}
                style={[
                    estilos.titulo,
                    selecionado
                    && (
                        perigo
                            ? estilos
                                .tituloPerigo
                            : estilos
                                .tituloManter
                    )
                ]}
            >
                {titulo}
            </Text>
        </Pressable>
    )
}

export {CategoryDecisionOption}