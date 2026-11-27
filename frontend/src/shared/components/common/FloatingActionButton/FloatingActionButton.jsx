/**
 * Ação global de adição posicionada sobre o conteúdo visível da tela.
 */
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';

import { useKeyboard } from '../../../hooks/useKeyboard';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './FloatingActionButton.styles';

function obterEstiloPressionado({ pressionado, bloqueado, reducaoMovimento, estiloPressionado }) {
    return pressionado && !bloqueado && !reducaoMovimento ? estiloPressionado : null;
}

function FloatingActionButton({
    aoPressionar,
    rotuloAcessibilidade,
    desativado = false,
    carregando = false,
    considerarAreaSeguraInferior = true,
    considerarAreaSeguraLateral = false,
    ocultarComTeclado = true,
    deslocamentoInferior = 0,
    estilo,
    testID = 'floating-action-button'
}) {
    const tema = useTheme();
    const insets = useSafeAreaInsets();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [focado, setFocado] = useState(false);
    const { visivel: tecladoVisivel } = useKeyboard();
    const reducaoMovimento = useReducedMotion();

    if (typeof rotuloAcessibilidade !== 'string' || !rotuloAcessibilidade.trim()) {
        throw new Error('FloatingActionButton precisa de um rótulo de acessibilidade.');
    }

    if (ocultarComTeclado && tecladoVisivel) return null;

    const bloqueado = desativado || carregando || typeof aoPressionar !== 'function';
    const distanciaInferior =
        tema.espacamentos.grande +
        deslocamentoInferior +
        (considerarAreaSeguraInferior ? insets.bottom : 0);

    return (
        <View
            pointerEvents="box-none"
            style={[
                estilos.posicionador,
                { bottom: distanciaInferior },
                considerarAreaSeguraLateral && { right: tema.espacamentos.grande + insets.right },
                estilo
            ]}
        >
            <Pressable
                testID={testID}
                accessibilityRole="button"
                accessibilityLabel={rotuloAcessibilidade.trim()}
                accessibilityState={{ disabled: bloqueado, busy: carregando }}
                disabled={bloqueado}
                onPress={aoPressionar}
                onFocus={() => setFocado(true)}
                onBlur={() => setFocado(false)}
                style={({ pressed }) => [
                    estilos.botao,
                    bloqueado && estilos.desativado,
                    focado && estilos.focado,
                    obterEstiloPressionado({
                        pressionado: pressed,
                        bloqueado,
                        reducaoMovimento,
                        estiloPressionado: estilos.pressionado
                    })
                ]}
            >
                {carregando ? (
                    <ActivityIndicator
                        testID="floating-action-button-loading"
                        color={estilos.corIcone}
                    />
                ) : (
                    <PlusIcon
                        testID="floating-action-button-icon"
                        accessible={false}
                        size={24}
                        weight="bold"
                        color={estilos.corIcone}
                    />
                )}
            </Pressable>
        </View>
    );
}

export { FloatingActionButton, obterEstiloPressionado };
