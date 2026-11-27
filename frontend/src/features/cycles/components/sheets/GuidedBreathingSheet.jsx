import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Text, View } from 'react-native';
import { Circle, Defs, RadialGradient, Stop, Svg } from 'react-native-svg';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { useBreathingAnimation } from '../../hooks/useBreathingAnimation';
import { estilos } from './GuidedBreathingSheet.styles';

function GuidedBreathingSheet({
    visivel,
    aoFechar,
    movimentoReduzido,
    duracaoInspiracao = 5000,
    duracaoExpiracao = 5000,
    escalaMaxima = 1.6
}) {
    const [reduzirMovimentoDoSistema, setReduzirMovimentoDoSistema] = useState(false);
    const reduzirMovimento = movimentoReduzido ?? reduzirMovimentoDoSistema;
    const { escala, instrucao, opacidadeTexto } = useBreathingAnimation({
        ativo: visivel && !reduzirMovimento,
        duracaoInspiracao,
        duracaoExpiracao,
        escalaMaxima
    });

    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduzirMovimentoDoSistema);
        const assinatura = AccessibilityInfo.addEventListener(
            'reduceMotionChanged',
            setReduzirMovimentoDoSistema
        );
        return () => assinatura.remove();
    }, []);

    const texto = reduzirMovimento ? 'Inspire e expire devagar, no seu ritmo.' : instrucao;
    return (
        <BottomSheet
            visivel={visivel}
            onFechar={aoFechar}
            fecharAoTocarFora
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
                        <View style={estilos.circuloInterno}>
                            <Svg width={121.11} height={121.11} style={estilos.gradiente}>
                                <Defs>
                                    <RadialGradient
                                        id="respiracao"
                                        cx="35%"
                                        cy="30%"
                                        rx="95.52%"
                                        ry="95.52%"
                                    >
                                        <Stop offset="0%" stopColor="#B8D3DC" />
                                        <Stop offset="100%" stopColor="#4A758E" />
                                    </RadialGradient>
                                </Defs>
                                <Circle
                                    cx={60.555}
                                    cy={60.555}
                                    r={60.555}
                                    fill="url(#respiracao)"
                                />
                            </Svg>
                            <Animated.Text style={[estilos.instrucao, { opacity: opacidadeTexto }]}>
                                {reduzirMovimento ? 'Respire' : instrucao}
                            </Animated.Text>
                        </View>
                    </Animated.View>
                </View>
            </View>
        </BottomSheet>
    );
}

export { GuidedBreathingSheet };
