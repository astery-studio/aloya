import { Text, View } from 'react-native';
import { CycleDiaryCheckIn } from '../CycleDiaryCheckIn';
import { CycleExpandableCard } from '../CycleExpandableCard';
import { CycleCareSection } from './CycleCareSection';
import { CycleEducationalDisclaimer } from './CycleEducationalDisclaimer';
import { CyclePhaseHero } from './CyclePhaseHero';
import { CORES_FASE } from './CyclePhaseHero.styles';
import { CyclePredictionSummary } from './CyclePredictionSummary';
import { CycleQuickActions } from './CycleQuickActions';
import { estilos } from './CycleHomeContent.styles';

function CycleHomeContent({ modelo, callbacks, diaryService, onSessaoExpirada }) {
    const { fase, diaCiclo, janelaFertilAtiva, previsao, conteudoDaFase, dataSelecionada } = modelo;
    const corDaFase = CORES_FASE[fase] ?? CORES_FASE.desconhecida;
    return (
        <View style={estilos.conteudo}>
            <CyclePhaseHero fase={fase} diaCiclo={diaCiclo} janelaFertilAtiva={janelaFertilAtiva} />
            <CycleQuickActions {...callbacks} />
            <CyclePredictionSummary
                proximoInicio={previsao.proximoInicioEstimado}
                ovulacaoEstimada={previsao.dataOvulacaoEstimada}
                janelaFertil={modelo.janelaFertil ?? previsao.janelaFertilEstimada}
                confiabilidade={modelo.nivelConfiabilidade ?? 'baixa'}
                estimativaIncerta={modelo.previsaoIncerta}
                aoAbrirConfiabilidade={callbacks.aoAbrirConfiabilidade}
                corDestaque={corDaFase}
            />
            <View style={estilos.explore}>
                <Text style={estilos.rotuloExplore}>Explore</Text>
                <Text accessibilityRole="header" style={estilos.tituloExplore}>
                    Conheça mais sobre seu ciclo
                </Text>
            </View>
            {diaryService ? (
                <CycleDiaryCheckIn
                    date={dataSelecionada}
                    service={diaryService}
                    onOpenDiary={callbacks.aoAbrirDiario}
                    onSessionExpired={onSessaoExpirada}
                    corDestaque={corDaFase}
                />
            ) : null}
            <CycleCareSection
                fase={fase}
                corDestaque={corDaFase}
                aoAbrirRespiracao={callbacks.aoAbrirRespiracao}
                aoAbrirReflexao={callbacks.aoAbrirReflexao}
                aoAbrirEducacao={callbacks.aoAbrirEducacao}
            />
            <View style={estilos.sobreFase}>
                <CycleExpandableCard
                    rotulo="Sobre esta fase"
                    corRotulo={corDaFase}
                    titulo={conteudoDaFase?.tituloExplicacao}
                >
                    <Text style={estilos.descricaoFase}>{conteudoDaFase?.descricao}</Text>
                    <CycleEducationalDisclaimer
                        texto="Este conteúdo é educativo e não substitui orientação profissional."
                        style={estilos.avisoFase}
                    />
                </CycleExpandableCard>
            </View>
        </View>
    );
}

export { CycleHomeContent };
