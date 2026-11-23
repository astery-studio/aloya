import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { BottomSheetLayout } from '../../../../shared/layouts/BottomSheet/BottomSheetLayout';

function GuidedBreathingSheet({ visivel, aoFechar, movimentoReduzido = false }) {
    const escala = useRef(new Animated.Value(1)).current;
    const [instrucao, setInstrucao] = useState('Prepare-se');

    useEffect(() => {
        if (!visivel || movimentoReduzido) return undefined;
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
    }, [escala, movimentoReduzido, visivel]);

    const texto = movimentoReduzido ? 'Inspire e expire devagar, no seu ritmo.' : instrucao;
    return (
        <BottomSheet visivel={visivel} onFechar={aoFechar}>
            <BottomSheetLayout titulo="Um respiro para você" onFechar={aoFechar}>
                <View style={{ alignItems: 'center', gap: 24 }}>
                    <Text accessibilityLiveRegion="polite">{texto}</Text>
                    <Animated.View
                        accessibilityElementsHidden
                        style={{
                            width: 128,
                            height: 128,
                            borderRadius: 64,
                            backgroundColor: '#EAC3B1',
                            transform: [{ scale: escala }]
                        }}
                    />
                    <Text>Respire confortavelmente. Você pode fechar quando quiser.</Text>
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    );
}

export { GuidedBreathingSheet };
