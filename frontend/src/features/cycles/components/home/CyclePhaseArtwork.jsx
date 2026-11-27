import { Image, View } from 'react-native';
import { CyclePhaseFrame } from './CyclePhaseFrame';
import { estilos } from './CyclePhaseArtwork.styles';

const IMAGENS_DAS_FASES = Object.freeze({
    menstrual: require('../../assets/phase-artwork/menstrual.png'),
    folicular: require('../../assets/phase-artwork/follicular.png'),
    ovulatoria: require('../../assets/phase-artwork/ovulatory.png'),
    lutea: require('../../assets/phase-artwork/luteal.png')
});

const ROTULOS_DAS_FASES = Object.freeze({
    menstrual: 'Ilustração da fase menstrual',
    folicular: 'Ilustração da fase folicular',
    ovulatoria: 'Ilustração da fase ovulatória',
    lutea: 'Ilustração da fase lútea'
});

function CyclePhaseArtwork({ fase, diaCiclo, duracaoCiclo, exibirContornoSemDuracao }) {
    const imagem = IMAGENS_DAS_FASES[fase];

    if (!imagem) return null;

    return (
        <View testID="cycle-phase-artwork" style={estilos.container}>
            <View testID="cycle-phase-image-mask" style={estilos.mascara}>
                <Image
                    testID="cycle-phase-image"
                    source={imagem}
                    resizeMode="contain"
                    accessibilityLabel={ROTULOS_DAS_FASES[fase]}
                    style={estilos.imagem}
                />
            </View>
            <View pointerEvents="none" style={estilos.moldura}>
                <CyclePhaseFrame
                    fase={fase}
                    diaCiclo={diaCiclo}
                    duracaoCiclo={duracaoCiclo}
                    exibirContornoSemDuracao={exibirContornoSemDuracao}
                />
            </View>
        </View>
    );
}

export { CyclePhaseArtwork, IMAGENS_DAS_FASES, ROTULOS_DAS_FASES };
