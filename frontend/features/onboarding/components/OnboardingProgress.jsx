/**
 * Indicador acessível do progresso entre as etapas do cadastro.
 */
import { View } from 'react-native';
import { estilos } from './OnboardingProgress.styles';

export default function OnboardingProgress({ etapaAtual, totalEtapas = 5 }) {
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
                <View testID="progresso-preenchido"
                    style={[estilos.progresso, { width: `${percentual}%` }]} />
            </View>
        </View>
    );
}
