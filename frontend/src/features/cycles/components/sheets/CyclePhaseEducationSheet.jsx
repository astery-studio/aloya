import { Text, View } from 'react-native';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { BottomSheetLayout } from '../../../../shared/layouts/BottomSheet/BottomSheetLayout';
import { conteudoPorFase } from '../../constants/phaseContent';
import { CycleEducationalDisclaimer } from '../home/CycleEducationalDisclaimer';
import { NOMES_DAS_FASES } from '../home/CyclePhaseHero';

const AVISO_EDUCATIVO =
    'Cada corpo vive o ciclo de um jeito. Este conteúdo é educativo e não substitui orientação profissional.';

function CyclePhaseEducationSheet({ visivel, fase, aoFechar }) {
    const conteudo = conteudoPorFase[fase] ?? conteudoPorFase.menstrual;
    const nome = NOMES_DAS_FASES[fase] ?? NOMES_DAS_FASES.desconhecida;
    return (
        <BottomSheet visivel={visivel} onFechar={aoFechar}>
            <BottomSheetLayout titulo={nome} onFechar={aoFechar}>
                <View style={{ gap: 16 }}>
                    <Text>{conteudo.descricao}</Text>
                    <CycleEducationalDisclaimer texto={AVISO_EDUCATIVO} />
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    );
}

export { CyclePhaseEducationSheet };
