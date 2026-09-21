//Mostra uma linha que abre outra tela ou painel.
import { Pressable, Text, View } from 'react-native'
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight'

import { tema } from '../../../theme'
import { estilos, corSeta, corSetaBotao } from './NavigationField.style'

const paletasDosIcones = {
    configVerde:
        tema.cores.icones.configuracoes.verde,

    configAzul:
        tema.cores.icones.configuracoes.azul,

    configLaranja:
        tema.cores.icones.configuracoes.laranja,

    anticoncepcionalVermelho:
        tema.cores.icones.anticoncepcionais.vermelho,

    anticoncepcionalVerde:
        tema.cores.icones.anticoncepcionais.verde
}

/**
 * Recebe o nome de uma paleta.
 * Procura as cores exatas da caixa e do ícone.
 * Retorna configVerde se o nome recebido não existir.
 */
function obterPaleta(paleta) {
    return (
        paletasDosIcones[paleta]
        ?? paletasDosIcones.configVerde
    )
}

/**
 * Recebe texto, ícone Phosphor, aparência e ação de toque.
 * Mostra uma linha que pode abrir outra tela ou painel.
 * Retorna o campo de navegação.
 *
 * variante aceita: "comBorda", "semBorda" ou "botao".
 *
 * paleta aceita:
 * "configVerde",
 * "configAzul",
 * "configLaranja",
 * "anticoncepcionalVermelho"
 * ou "anticoncepcionalVerde".
 */
function NavigationField({
    label,
    icone: Icone,
    onPress,
    variante = 'comBorda',
    paleta = 'configVerde',
    desabilitado = false
}) {
    const coresDoIcone = obterPaleta(paleta)

    const semBorda =
        variante === 'semBorda'

    const ehBotao =
        variante === 'botao'

    const estaDesabilitado =
        desabilitado
        || typeof onPress !== 'function'

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
                ehBotao && estilos.botao,
                estaDesabilitado
                    && estilos.desabilitado
            ]}
        >
            {Icone ? (
                <View
                    style={[
                        estilos.caixaIcone,
                        ehBotao
                            && estilos.caixaIconeBotao,
                        {
                            backgroundColor:
                                coresDoIcone.caixa
                        }
                    ]}
                >
                    <Icone
                        size={
                            semBorda || ehBotao
                                ? 24
                                : 20
                        }
                        color={coresDoIcone.icone}
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
                size={
                    semBorda || ehBotao
                        ? 20
                        : 18
                }
                color={
                    ehBotao
                        ? corSetaBotao
                        : corSeta
                }
                weight="regular"
            />
        </Pressable>
    )
}

export { NavigationField }