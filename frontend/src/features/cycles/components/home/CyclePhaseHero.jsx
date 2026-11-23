import { Text, View } from 'react-native';
import { SparkleIcon } from '../../../../shared/components/icons/AppIcons';
import { PhaseSymbolSlot } from '../PhaseSymbolSlot';
import { CORES_FASE, estilos } from './CyclePhaseHero.styles';

const NOMES_DAS_FASES = Object.freeze({
    menstrual: 'Fase Menstrual',
    folicular: 'Fase Folicular',
    ovulatoria: 'Fase Ovulatória',
    lutea: 'Fase Lútea',
    desconhecida: 'Seu ciclo'
});

function CyclePhaseHero({ fase, diaCiclo, janelaFertilAtiva = false, symbol }) {
    const faseAtual = Object.hasOwn(NOMES_DAS_FASES, fase) ? fase : 'desconhecida';
    const corDaFase = CORES_FASE[faseAtual];

    return (
        <View style={estilos.container}>
            <PhaseSymbolSlot>{symbol}</PhaseSymbolSlot>
            <Text accessibilityRole="header" style={estilos.titulo}>
                {NOMES_DAS_FASES[faseAtual]}
            </Text>
            {diaCiclo ? <Text style={estilos.dia}>Dia {diaCiclo} do ciclo</Text> : null}
            {janelaFertilAtiva ? (
                <View style={estilos.margemFertil}>
                    <View
                        accessibilityLabel="Janela fértil ativa"
                        style={[estilos.fertil, { borderColor: corDaFase }]}
                    >
                        <View style={estilos.icone}>
                            <SparkleIcon size={22} color={corDaFase} weight="fill" />
                        </View>
                        <View>
                            <Text style={estilos.tituloFertil}>Janela fértil</Text>
                            <Text style={estilos.textoFertil}>Você está na janela fértil.</Text>
                        </View>
                    </View>
                </View>
            ) : null}
        </View>
    );
}

export { CyclePhaseHero, NOMES_DAS_FASES };
