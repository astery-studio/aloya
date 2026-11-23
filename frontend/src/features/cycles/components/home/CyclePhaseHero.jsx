import { Text, View } from 'react-native';
import { SparkleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { PhaseSymbolSlot } from '../PhaseSymbolSlot';

const NOMES_DAS_FASES = Object.freeze({
    menstrual: 'Fase Menstrual',
    folicular: 'Fase Folicular',
    ovulatoria: 'Fase Ovulatória',
    lutea: 'Fase Lútea',
    desconhecida: 'Seu ciclo'
});

function CyclePhaseHero({ fase, diaCiclo, janelaFertilAtiva = false, symbol }) {
    const tema = useTheme();
    const faseAtual = Object.hasOwn(NOMES_DAS_FASES, fase) ? fase : 'desconhecida';

    return (
        <View style={{ alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
            <PhaseSymbolSlot>{symbol}</PhaseSymbolSlot>
            <Text accessibilityRole="header" style={{ fontFamily: 'DMSans_700Bold', fontSize: 28 }}>
                {NOMES_DAS_FASES[faseAtual]}
            </Text>
            {diaCiclo ? <Text>Dia {diaCiclo} do ciclo</Text> : null}
            {janelaFertilAtiva ? (
                <View
                    accessibilityLabel="Janela fértil ativa"
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                    <SparkleIcon size={20} color={tema.cores.feedback.informacao} weight="fill" />
                    <Text>Você está na janela fértil.</Text>
                </View>
            ) : null}
        </View>
    );
}

export { CyclePhaseHero, NOMES_DAS_FASES };
