import { useMemo } from 'react';
import { Image, Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import {
    CyclePhaseArtwork,
    IMAGENS_DAS_FASES
} from '../../../cycles/components/home/CyclePhaseArtwork';
import { NOMES_DAS_FASES } from '../../../cycles/components/home/CyclePhaseHero';
import { criarEstilos } from './SupportedCycleHero.styles';

const ARTE_SEM_CICLO = require('../../assets/cycle-without-data.png');

function SupportedCycleHero({
    nomeTitular,
    fase,
    possuiDadosCiclo = false,
    exibirFase = false,
    diaCiclo,
    duracaoCiclo
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    if (!exibirFase) return null;

    const possuiFase = possuiDadosCiclo && Object.hasOwn(IMAGENS_DAS_FASES, fase);
    const mostrarDia = possuiFase && Number.isSafeInteger(diaCiclo) && diaCiclo > 0;

    return (
        <View style={estilos.container}>
            <View style={estilos.boasVindas}>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    Acompanhe com carinho
                </Text>
                <Text style={estilos.descricao}>
                    Conheça melhor cada momento do ciclo e descubra formas de oferecer apoio,
                    respeitando o ritmo e as necessidades de quem você acompanha.
                </Text>
            </View>
            <View style={estilos.areaArte}>
                {possuiFase ? (
                    <CyclePhaseArtwork
                        fase={fase}
                        diaCiclo={diaCiclo}
                        duracaoCiclo={duracaoCiclo}
                        exibirContornoSemDuracao
                    />
                ) : (
                    <Image
                        accessible={false}
                        source={ARTE_SEM_CICLO}
                        resizeMode="contain"
                        style={estilos.arteSemCiclo}
                        testID="supported-cycle-artwork-empty"
                    />
                )}
            </View>
            {possuiFase ? (
                <Text accessibilityRole="header" style={estilos.fase}>
                    {NOMES_DAS_FASES[fase]}
                </Text>
            ) : null}
            {mostrarDia ? (
                <Text style={estilos.dia}>
                    Dia {diaCiclo} do ciclo de {nomeTitular}
                </Text>
            ) : null}
        </View>
    );
}

export { SupportedCycleHero };
