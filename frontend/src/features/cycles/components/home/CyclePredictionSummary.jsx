import { useHomeColors } from '../../hooks/useHomeColors';
import { Text, View } from 'react-native';
import { ConfidenceBadge } from '../../../../shared/components/common/ConfidenceBadge/ConfidenceBadge';
import { StatusBadge } from '../../../../shared/components/common/StatusBadge/StatusBadge';
import { SparkleIcon, SunIcon } from '../../../../shared/components/icons/AppIcons';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';
import { formatarJanelaFertil, separarData } from '../../utils/cyclePredictionFormat';
import { CycleEducationalDisclaimer } from './CycleEducationalDisclaimer';
import { estilos as estilosClaros } from './CyclePredictionSummary.styles';
import { textos as textosClaros } from './CyclePredictionSummary.textStyles';

const AVISO_PREVISAO =
    'Esta é uma estimativa baseada no seu histórico e não deve ser usada como método contraceptivo.';

const CONFIABILIDADE_NOTURNA = {
    baixa: {
        cor: coresNoturnasConteudo.coral,
        fundo: 'rgba(194, 110, 95, 0.14)',
        borda: 'rgba(194, 110, 95, 0.45)'
    },
    media: {
        cor: '#D68C3A',
        fundo: 'rgba(214, 140, 58, 0.14)',
        borda: 'rgba(214, 140, 58, 0.45)'
    },
    alta: {
        cor: coresNoturnasConteudo.verde,
        fundo: 'rgba(165, 214, 167, 0.14)',
        borda: 'rgba(165, 214, 167, 0.45)'
    }
};

function Metrica({ Icone, rotulo, valor, cor, estilos, textos }) {
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
    nomeTitular,
    corDestaque = '#C85A44'
}) {
    const { estilos, cor: adaptarCor, escuro } = useHomeColors(estilosClaros);
    const { estilos: textos } = useHomeColors(textosClaros);
    const proximo = separarData(proximoInicio);
    const ovulacao = separarData(ovulacaoEstimada);
    const intervalo = formatarJanelaFertil(janelaFertil);

    return (
        <View style={estilos.margem}>
            <View style={estilos.card}>
                <View style={estilos.cabecalho}>
                    <View style={estilos.textosCabecalho}>
                        <Text style={[textos.previsao, { color: adaptarCor(corDestaque) }]}>
                            Previsão
                        </Text>
                        <Text accessibilityRole="header" style={textos.titulo}>
                            {nomeTitular ? `Próximo ciclo de ${nomeTitular}` : 'Próximo ciclo'}
                        </Text>
                    </View>
                    <ConfidenceBadge
                        nivel={confiabilidade}
                        coresPersonalizadas={
                            escuro ? CONFIABILIDADE_NOTURNA[confiabilidade] : undefined
                        }
                        onPress={aoAbrirConfiabilidade}
                        exibirPrefixo={false}
                    />
                </View>
                <View style={estilos.metricas}>
                    <View style={estilos.data}>
                        <Text style={textos.dia}>{proximo.dia}</Text>
                        <View style={estilos.textosData}>
                            <Text
                                adjustsFontSizeToFit
                                minimumFontScale={0.5}
                                numberOfLines={1}
                                style={textos.mes}
                            >
                                {proximo.mes}
                            </Text>
                            <Text style={textos.estimativa}>estimativa</Text>
                        </View>
                    </View>
                    <View style={estilos.secundarias}>
                        <Metrica
                            Icone={SunIcon}
                            rotulo="Ovulação prevista"
                            valor={`${ovulacao.dia} de ${ovulacao.mes}`}
                            cor={adaptarCor('#4A758E')}
                            estilos={estilos}
                            textos={textos}
                        />
                        <Metrica
                            Icone={SparkleIcon}
                            rotulo="Janela fértil estimada"
                            valor={intervalo}
                            cor={adaptarCor('#222222')}
                            estilos={estilos}
                            textos={textos}
                        />
                    </View>
                </View>
                {!nomeTitular ? (
                    <>
                        <CycleEducationalDisclaimer
                            texto={AVISO_PREVISAO}
                            variante="contraceptiva"
                            style={estilos.aviso}
                        />
                        {estimativaIncerta ? (
                            <StatusBadge estado="estimativaIncerta" estilo={estilos.incerta} />
                        ) : null}
                    </>
                ) : null}
            </View>
        </View>
    );
}

export { AVISO_PREVISAO, CyclePredictionSummary };
