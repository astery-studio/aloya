//Mostra uma permissão que pode ser ligada ou desligada pela pessoa usuária.
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';

import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './SwitchField.styles';

//Recebe o estado atual, anima o indicador e informa o novo valor ao componente pai.
function SwitchField({
    titulo,
    ativo = false,
    aoAlterar,
    desabilitado = false,
    somenteControle = false,
    rotuloAcessibilidade,
    estilo,
    estiloTitulo
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const estaAtivo = ativo === true;
    const estaDesabilitado = desabilitado || typeof aoAlterar !== 'function';

    const [deslocamento] = useState(() => new Animated.Value(estaAtivo ? 20 : 0));

    const rotuloDoInterruptor = rotuloAcessibilidade || titulo || 'Interruptor de permissão';

    useEffect(() => {
        const animacao = Animated.timing(deslocamento, {
            toValue: estaAtivo ? 20 : 0,
            duration: 160,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
        });

        animacao.start();

        return () => {
            animacao.stop();
        };
    }, [deslocamento, estaAtivo]);

    //Inverte o estado atual e devolve o novo valor ao componente que controla a permissão.
    const alternar = useCallback(() => {
        if (!estaDesabilitado) {
            aoAlterar(!estaAtivo);
        }
    }, [aoAlterar, estaAtivo, estaDesabilitado]);

    const trilhaDoInterruptor = (
        <View
            testID="switch-field-track"
            style={[estilos.trilha, estaAtivo ? estilos.trilhaAtiva : estilos.trilhaInativa]}
            pointerEvents="none"
        >
            <Animated.View
                testID="switch-field-thumb"
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
    );

    if (somenteControle) {
        return (
            <Pressable
                onPress={alternar}
                disabled={estaDesabilitado}
                accessibilityRole="switch"
                accessibilityLabel={rotuloDoInterruptor}
                accessibilityHint={'Ativa ou desativa as permissões deste grupo'}
                accessibilityState={{
                    checked: estaAtivo,
                    disabled: estaDesabilitado
                }}
                style={({ pressed }) => [
                    estilos.controle,
                    pressed && !estaDesabilitado && estilos.pressionado,
                    estaDesabilitado && estilos.desabilitado,
                    estilo
                ]}
            >
                {trilhaDoInterruptor}
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={alternar}
            disabled={estaDesabilitado}
            accessibilityRole="switch"
            accessibilityLabel={rotuloDoInterruptor}
            accessibilityHint={'Ativa ou desativa esta permissão'}
            accessibilityState={{
                checked: estaAtivo,
                disabled: estaDesabilitado
            }}
            style={({ pressed }) => [
                estilos.container,
                pressed && !estaDesabilitado && estilos.pressionado,
                estaDesabilitado && estilos.desabilitado,
                estilo
            ]}
        >
            <Text style={[estilos.titulo, estiloTitulo]} numberOfLines={2}>
                {titulo}
            </Text>

            {trilhaDoInterruptor}
        </Pressable>
    );
}

export default memo(SwitchField);
