//Mostra um botão compacto formado apenas por um ícone.
import {Pressable} from 'react-native'
import {estilos, variantes} from './IconButton.styles'

function IconButton({icone: Icone, aoPressionar, rotuloAcessibilidade, variante = 'neutro', desativado = false}) {
    if (!Icone) {
        throw new Error('IconButton precisa receber um ícone.')
    }

    if (typeof rotuloAcessibilidade !== 'string' || !rotuloAcessibilidade.trim()) {
        throw new Error('IconButton precisa de um rótulo de acessibilidade.')
    }

    if (!variantes[variante]) {
        throw new Error(`Variante de IconButton inválida: ${variante}`)
    }

    const estaDesativado = desativado || variante === 'desativado' || typeof aoPressionar !== 'function'
    const varianteVisual = estaDesativado ? variantes.desativado : variantes[variante]
    const tamanhoIcone = variantes[variante].tamanhoIcone || 20

    return (
        <Pressable
            onPress={aoPressionar}
            disabled={estaDesativado}
            accessibilityRole="button"
            accessibilityLabel={rotuloAcessibilidade.trim()}
            accessibilityState={{
                disabled: estaDesativado,
                selected: variante === 'selecionado'
            }}
            hitSlop={4}
            style={({pressed}) => [
                estilos.container,
                varianteVisual.container,
                pressed && !estaDesativado && estilos.pressionado
            ]}
        >
            <Icone
                size={tamanhoIcone}
                color={varianteVisual.icone}
                weight="regular"
            />
        </Pressable>
    )
}

export {IconButton}
