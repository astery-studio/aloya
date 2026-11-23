import { Text, View } from 'react-native';
import { CycleDiaryCheckIn } from '../CycleDiaryCheckIn';
import { CycleExpandableCard } from '../CycleExpandableCard';
import { CycleCareSection } from './CycleCareSection';
import { CycleEducationalDisclaimer } from './CycleEducationalDisclaimer';
import { CyclePhaseHero } from './CyclePhaseHero';
import { CyclePredictionSummary } from './CyclePredictionSummary';
import { CycleQuickActions } from './CycleQuickActions';

function CycleHomeContent({ modelo, callbacks, diaryService, onSessaoExpirada }) {
    const { fase, diaCiclo, janelaFertilAtiva, previsao, conteudoDaFase, dataSelecionada } = modelo;
    return (
        <View style={{ paddingBottom: 40 }}>
            <CyclePhaseHero fase={fase} diaCiclo={diaCiclo} janelaFertilAtiva={janelaFertilAtiva} />
            <CycleQuickActions {...callbacks} />
            <CyclePredictionSummary
                proximoInicio={previsao.proximoInicioEstimado}
                ovulacaoEstimada={previsao.dataOvulacaoEstimada}
                janelaFertil={modelo.janelaFertil ?? previsao.janelaFertilEstimada}
                confiabilidade={modelo.nivelConfiabilidade ?? 'baixa'}
                estimativaIncerta={modelo.previsaoIncerta}
                aoAbrirConfiabilidade={callbacks.aoAbrirConfiabilidade}
            />
            <View style={{ paddingTop: 34, paddingHorizontal: 16 }}>
                <Text>EXPLORE</Text>
                <Text accessibilityRole="header" style={{ fontSize: 21 }}>
                    Conheça mais sobre seu ciclo
                </Text>
            </View>
            {diaryService ? (
                <CycleDiaryCheckIn
                    date={dataSelecionada}
                    service={diaryService}
                    onOpenDiary={callbacks.aoAbrirDiario}
                    onSessionExpired={onSessaoExpirada}
                />
            ) : null}
            <CycleCareSection
                fase={fase}
                aoAbrirRespiracao={callbacks.aoAbrirRespiracao}
                aoAbrirReflexao={callbacks.aoAbrirReflexao}
                aoAbrirEducacao={callbacks.aoAbrirEducacao}
            />
            <View style={{ padding: 16 }}>
                <CycleExpandableCard
                    titulo="Sobre esta fase"
                    subtitulo={conteudoDaFase?.tituloExplicacao}
                    initiallyExpanded
                >
                    <Text>{conteudoDaFase?.descricao}</Text>
                    <CycleEducationalDisclaimer texto="Este conteúdo é educativo e não substitui orientação profissional." />
                </CycleExpandableCard>
            </View>
        </View>
    );
}

export { CycleHomeContent };
