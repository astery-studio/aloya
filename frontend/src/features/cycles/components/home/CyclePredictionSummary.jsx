import { Text, View } from 'react-native';
import { ConfidenceBadge } from '../../../../shared/components/common/ConfidenceBadge/ConfidenceBadge';
import { StatusBadge } from '../../../../shared/components/common/StatusBadge/StatusBadge';
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
    aoAbrirConfiabilidade,
    corDestaque = '#C85A44'
}) {
    const proximo = separarData(proximoInicio);
    const ovulacao = separarData(ovulacaoEstimada);
    const intervalo = formatarJanelaFertil(janelaFertil);

    return (
        <View style={estilos.margem}>
            <View style={estilos.card}>
                <View style={estilos.cabecalho}>
                    <View style={estilos.textosCabecalho}>
                        <Text style={[textos.previsao, { color: corDestaque }]}>Previsão</Text>
                        <Text accessibilityRole="header" style={textos.titulo}>
                            Próximo ciclo
                        </Text>
                    </View>
                    <ConfidenceBadge
                        nivel={confiabilidade}
                        onPress={aoAbrirConfiabilidade}
                        exibirPrefixo={false}
                    />
                </View>
                <View style={estilos.metricas}>
                    <View style={estilos.data}>
                        <Text style={textos.dia}>{proximo.dia}</Text>
                        <View style={estilos.textosMetrica}>
                            <Text style={textos.mes}>{proximo.mes}</Text>
                            <Text style={textos.estimativa}>estimativa</Text>
                        </View>
                    </View>
                    <View style={estilos.secundarias}>
                        <Metrica
                            Icone={SunIcon}
                            rotulo="Ovulação prevista"
                            valor={`${ovulacao.dia} de ${ovulacao.mes}`}
                            cor="#4A758E"
                        />
                        <Metrica
                            Icone={SparkleIcon}
                            rotulo="Janela fértil estimada"
                            valor={intervalo}
                            cor="#222222"
                        />
                    </View>
                </View>
                <CycleEducationalDisclaimer
                    texto={AVISO_PREVISAO}
                    variante="contraceptiva"
                    style={estilos.aviso}
                />
                {estimativaIncerta ? (
                    <StatusBadge estado="estimativaIncerta" estilo={estilos.incerta} />
                ) : null}
            </View>
        </View>
    );
}

export { AVISO_PREVISAO, CyclePredictionSummary };
