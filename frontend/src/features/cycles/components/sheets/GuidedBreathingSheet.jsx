import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Text, View } from 'react-native';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { estilos } from './GuidedBreathingSheet.styles';

function GuidedBreathingSheet({ visivel, aoFechar, movimentoReduzido }) {
    const escala = useRef(new Animated.Value(1)).current;
    const [instrucao, setInstrucao] = useState('Prepare-se');
    const [reduzirMovimentoDoSistema, setReduzirMovimentoDoSistema] = useState(false);
    const reduzirMovimento = movimentoReduzido ?? reduzirMovimentoDoSistema;

    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduzirMovimentoDoSistema);
        const assinatura = AccessibilityInfo.addEventListener(
            'reduceMotionChanged',
            setReduzirMovimentoDoSistema
        );
        return () => assinatura.remove();
    }, []);

    useEffect(() => {
        if (!visivel || reduzirMovimento) return undefined;
        setInstrucao('Inspire devagar');
        const animacao = Animated.loop(
            Animated.sequence([
                Animated.timing(escala, { toValue: 1.35, duration: 4000, useNativeDriver: true }),
                Animated.timing(escala, { toValue: 1, duration: 4000, useNativeDriver: true })
            ])
        );
        animacao.start();
        const intervalo = setInterval(
            () =>
                setInstrucao((atual) =>
                    atual.startsWith('Inspire') ? 'Expire devagar' : 'Inspire devagar'
                ),
            4000
        );
        return () => {
            clearInterval(intervalo);
            animacao.stop();
        };
    }, [escala, reduzirMovimento, visivel]);

    const texto = reduzirMovimento ? 'Inspire e expire devagar, no seu ritmo.' : instrucao;
    return (
        <BottomSheet
            visivel={visivel}
            onFechar={aoFechar}
            permitirDeslizarParaFechar
            estiloPainel={estilos.painel}
            corPainel="#FFFFFF"
        >
            <View style={estilos.conteudo}>
                <Text style={estilos.rotulo}>Pausa guiada</Text>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    Acompanhe o movimento
                </Text>
                <Text style={estilos.descricao}>
                    Inspire quando o círculo crescer e expire quando ele se recolher. Faça no seu
                    ritmo, sem obrigação.
                </Text>
                <View style={estilos.areaRespiracao}>
                    <Animated.View
                        accessibilityLiveRegion="polite"
                        accessibilityLabel={texto}
                        style={[estilos.circulo, { transform: [{ scale: escala }] }]}
                    >
                        <Text style={estilos.instrucao}>
                            {reduzirMovimento ? texto : 'Respire'}
                        </Text>
                    </Animated.View>
                </View>
            </View>
        </BottomSheet>
    );
}

export { GuidedBreathingSheet };
