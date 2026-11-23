import { Text, View } from 'react-native';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { BottomSheetLayout } from '../../../../shared/layouts/BottomSheet/BottomSheetLayout';

const EXPLICACOES = Object.freeze({
    baixa: 'Ainda há poucos registros para estimar o ciclo com precisão.',
    media: 'A estimativa usa seu histórico, mas ainda pode variar.',
    alta: 'Seu histórico recente permite uma estimativa mais consistente.'
});

function CycleConfidenceSheet({ visivel, nivel, aoFechar }) {
    const atual = Object.hasOwn(EXPLICACOES, nivel) ? nivel : 'baixa';
    return (
        <BottomSheet visivel={visivel} onFechar={aoFechar}>
            <BottomSheetLayout titulo="Confiabilidade da previsão" onFechar={aoFechar}>
                <View style={{ gap: 16 }}>
                    <Text>{EXPLICACOES[atual]}</Text>
                    <View accessibilityLabel={`Nível atual: ${atual}`} style={{ gap: 8 }}>
                        {Object.keys(EXPLICACOES).map((item) => (
                            <View
                                key={item}
                                accessibilityState={{ selected: item === atual }}
                                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                            >
                                <Text>{item[0].toUpperCase() + item.slice(1)}</Text>
                                {item === atual ? <Text>Atual</Text> : null}
                            </View>
                        ))}
                    </View>
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    );
}

export { CycleConfidenceSheet, EXPLICACOES };
