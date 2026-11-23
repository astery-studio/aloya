import { Text, View } from 'react-native';
import { ConfidenceBadge } from '../../../../shared/components/common/ConfidenceBadge/ConfidenceBadge';
import { formatarDataLonga } from '../../utils/cyclePresentation';
import { CycleEducationalDisclaimer } from './CycleEducationalDisclaimer';

const AVISO_PREVISAO =
    'Esta é uma estimativa baseada no seu histórico e não deve ser usada como método contraceptivo.';

function Metrica({ rotulo, valor }) {
    return (
        <View style={{ flex: 1, minWidth: 132, gap: 4 }}>
            <Text>{rotulo}</Text>
            <Text style={{ fontFamily: 'DMSans_600SemiBold' }}>{valor || 'Indisponível'}</Text>
        </View>
    );
}

function CyclePredictionSummary({
    proximoInicio,
    ovulacaoEstimada,
    janelaFertil,
    confiabilidade,
    estimativaIncerta = false,
    aoAbrirConfiabilidade
}) {
    const intervalo = janelaFertil
        ? `${formatarDataLonga(janelaFertil.inicio)} até ${formatarDataLonga(janelaFertil.fim)}`
        : null;

    return (
        <View style={{ padding: 16, gap: 16 }}>
            <Text accessibilityRole="header" style={{ fontFamily: 'DMSans_700Bold', fontSize: 20 }}>
                Sua previsão
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                <Metrica rotulo="Próximo ciclo" valor={formatarDataLonga(proximoInicio)} />
                <ConfidenceBadge nivel={confiabilidade} onPress={aoAbrirConfiabilidade} />
                <Metrica rotulo="Ovulação prevista" valor={formatarDataLonga(ovulacaoEstimada)} />
                <Metrica rotulo="Janela fértil" valor={intervalo} />
            </View>
            {estimativaIncerta ? <Text>Estimativa incerta</Text> : null}
            <CycleEducationalDisclaimer texto={AVISO_PREVISAO} variante="contraceptiva" />
        </View>
    );
}

export { AVISO_PREVISAO, CyclePredictionSummary };
