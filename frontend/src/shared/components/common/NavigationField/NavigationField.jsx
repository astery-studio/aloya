//Mostra uma linha que abre outra tela ou painel.
import { Pressable, Text, View } from 'react-native'
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight'

import { tema } from '../../../theme'
import { estilos, setaConfig, corSetaBotao } from './NavigationField.style'

const paletasDosIcones = {
    corVerde: tema.cores.icones.configuracoes.verde,
    corAzul: tema.cores.icones.configuracoes.azul,
    corLaranja: tema.cores.icones.configuracoes.laranja,
    corVermelho: tema.cores.icones.anticoncepcionais.vermelho,
    corVerde2: tema.cores.icones.anticoncepcionais.verde
}

function obterPaleta(paleta) {
    return (
        paletasDosIcones[paleta] ?? paletasDosIcones.corVerde
    )
}

function NavigationField({label, icone: Icone, onPress, variante = 'comBorda', paleta = 'corVerde', desabilitado = false}) {
    const coresDoIcone = obterPaleta(paleta)

    const semBorda = variante === 'semBorda'
    const ehBotao = variante === 'botao'
    const estaDesabilitado = desabilitado || typeof onPress !== 'function'

    return (
        <Pressable
            onPress={onPress}
            disabled={estaDesabilitado}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint="Abre outra tela ou painel"
            accessibilityState={{ disabled: estaDesabilitado }}
            style={[
                estilos.container,
                semBorda && estilos.semBorda,
                ehBotao && estilos.botao,
                estaDesabilitado && estilos.desabilitado
            ]}
        >
            {Icone ? (
                <View
                    style={[
                        estilos.caixaIcone,
                        ehBotao && estilos.caixaIconeBotao,
                        { backgroundColor: coresDoIcone.caixa }
                    ]}
                >
                    <Icone
                        size={semBorda || ehBotao ? 24 : 20}
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
                size={semBorda || ehBotao ? 20 : 18}
                color={ehBotao ? corSetaBotao : setaConfig}
                weight="regular"
            />
        </Pressable>
    )
}

export { NavigationField }