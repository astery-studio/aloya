import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

function useBreathingAnimation({ ativo, duracaoInspiracao, duracaoExpiracao, escalaMaxima }) {
    const escala = useRef(new Animated.Value(1)).current;
    const opacidadeTexto = useRef(new Animated.Value(1)).current;
    const [instrucao, setInstrucao] = useState('Inspire');

    useEffect(() => {
        escala.setValue(1);
        opacidadeTexto.setValue(1);
        setInstrucao('Inspire');
        if (!ativo) return undefined;

        const easing = Easing.bezier(0.45, 0.05, 0.55, 0.95);
        const animacao = Animated.loop(
            Animated.sequence([
                Animated.timing(escala, {
                    toValue: escalaMaxima,
                    duration: duracaoInspiracao,
                    easing,
                    useNativeDriver: true
                }),
                Animated.timing(escala, {
                    toValue: 1,
                    duration: duracaoExpiracao,
                    easing,
                    useNativeDriver: true
                })
            ])
        );
        let cancelado = false;
        let temporizador;
        function agendar(proxima, espera) {
            temporizador = setTimeout(() => {
                Animated.timing(opacidadeTexto, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true
                }).start(() => {
                    if (cancelado) return;
                    setInstrucao(proxima);
                    Animated.timing(opacidadeTexto, {
                        toValue: 1,
                        duration: 220,
                        useNativeDriver: true
                    }).start();
                    agendar(
                        proxima === 'Inspire' ? 'Expire' : 'Inspire',
                        proxima === 'Inspire' ? duracaoInspiracao : duracaoExpiracao
                    );
                });
            }, espera);
        }
        animacao.start();
        agendar('Expire', duracaoInspiracao);
        return () => {
            cancelado = true;
            clearTimeout(temporizador);
            animacao.stop();
        };
    }, [ativo, duracaoExpiracao, duracaoInspiracao, escala, escalaMaxima, opacidadeTexto]);

    return { escala, instrucao, opacidadeTexto };
}

export { useBreathingAnimation };
