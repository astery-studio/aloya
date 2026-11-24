import { Text, View } from 'react-native';
import { PhaseSymbolSlot } from '../PhaseSymbolSlot';
import { estilos } from './CyclePhaseHero.styles';
import { FertileHighlight } from './FertileHighlight';

const NOMES_DAS_FASES = Object.freeze({
    menstrual: 'Fase Menstrual',
    folicular: 'Fase Folicular',
    ovulatoria: 'Fase Ovulatória',
    lutea: 'Fase Lútea',
    desconhecida: 'Seu ciclo'
});

function CyclePhaseHero({ fase, diaCiclo, janelaFertilAtiva = false, symbol }) {
    const faseAtual = Object.hasOwn(NOMES_DAS_FASES, fase) ? fase : 'desconhecida';

    return (
        <View style={estilos.container}>
            <PhaseSymbolSlot>{symbol}</PhaseSymbolSlot>
            <Text accessibilityRole="header" style={estilos.titulo}>
                {NOMES_DAS_FASES[faseAtual]}
            </Text>
            {diaCiclo ? <Text style={estilos.dia}>Dia {diaCiclo} do ciclo</Text> : null}
            {janelaFertilAtiva ? <FertileHighlight /> : null}
        </View>
    );
}

export { CyclePhaseHero, NOMES_DAS_FASES };
