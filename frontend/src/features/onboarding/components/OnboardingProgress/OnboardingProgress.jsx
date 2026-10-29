/**
 * Indicador acessível do progresso entre as etapas do cadastro.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './OnboardingProgress.styles';

export default function OnboardingProgress({ etapaAtual, totalEtapas = 5 }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const etapa = Math.min(Math.max(etapaAtual, 0), totalEtapas);
    const percentual = totalEtapas > 0 ? (etapa / totalEtapas) * 100 : 0;

    return (
        <View
            accessibilityLabel={`Etapa ${etapa} de ${totalEtapas}`}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: totalEtapas, now: etapa }}
            style={estilos.area}
        >
            <View style={estilos.trilha}>
                <View
                    testID="progresso-preenchido"
                    style={[estilos.progresso, { width: `${percentual}%` }]}
                />
            </View>
        </View>
    );
}
