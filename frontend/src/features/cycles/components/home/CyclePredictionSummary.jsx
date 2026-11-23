import { Text, View } from 'react-native';
import { ConfidenceBadge } from '../../../../shared/components/common/ConfidenceBadge/ConfidenceBadge';
import { SparkleIcon, SunIcon } from '../../../../shared/components/icons/AppIcons';
import { formatarJanelaFertil, separarData } from '../../utils/cyclePredictionFormat';
import { CycleEducationalDisclaimer } from './CycleEducationalDisclaimer';
import { estilos } from './CyclePredictionSummary.styles';
import { textos } from './CyclePredictionSummary.textStyles';

const AVISO_PREVISAO =
    'Esta é uma estimativa baseada no seu histórico e não deve ser usada como método contraceptivo.';

function Metrica({ Icone, rotulo, valor, cor }) {
    return (
        <View style={estilos.metrica}>
            <Icone size={20} color={cor} weight="fill" />
            <View style={estilos.textosMetrica}>
                <Text style={textos.rotulo}>{rotulo}</Text>
                <Text style={textos.valor}>{valor}</Text>
            </View>
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
    const proximo = separarData(proximoInicio);
    const ovulacao = separarData(ovulacaoEstimada);
    const intervalo = formatarJanelaFertil(janelaFertil);

    return (
        <View style={estilos.margem}>
            <View style={estilos.card}>
                <View style={estilos.cabecalho}>
                    <View>
                        <Text style={textos.previsao}>Previsão</Text>
                        <Text accessibilityRole="header" style={textos.titulo}>
                            Próximo ciclo
                        </Text>
                    </View>
                    <ConfidenceBadge nivel={confiabilidade} onPress={aoAbrirConfiabilidade} />
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                    <Metrica
                        Icone={SunIcon}
                        rotulo="Próximo ciclo"
                        valor={`${proximo.dia} de ${proximo.mes}`}
                        cor="#C85A44"
                    />
                    <Metrica
                        Icone={SunIcon}
                        rotulo="Ovulação prevista"
                        valor={`${ovulacao.dia} de ${ovulacao.mes}`}
                        cor="#4A758E"
                    />
                    <Metrica
                        Icone={SparkleIcon}
                        rotulo="Janela fértil"
                        valor={intervalo}
                        cor="#222222"
                    />
                </View>
                {estimativaIncerta ? <Text>Estimativa incerta</Text> : null}
                <CycleEducationalDisclaimer texto={AVISO_PREVISAO} variante="contraceptiva" />
            </View>
        </View>
    );
}

export { AVISO_PREVISAO, CyclePredictionSummary };
