import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import { ClockCounterClockwiseIcon } from '../../../../shared/components/icons/AppIcons';
import { MainLayout } from '../../../../shared/layouts/MainLayout/MainLayout';
import { obterHojeLocal } from '../../../calendar/utils/cycleCalendar.utils';
import { CycleDateStrip } from '../../../cycles/components/CycleDateStrip';
import { CycleEducationSection } from '../../../cycles/components/CycleEducationSection';
import { ReturnToTodayButton } from '../../../cycles/components/ReturnToTodayButton';
import { NOMES_DAS_FASES } from '../../../cycles/components/home/CyclePhaseHero';
import { CORES_FASE } from '../../../cycles/components/home/CyclePhaseHero.styles';
import { CyclePredictionSummary } from '../../../cycles/components/home/CyclePredictionSummary';
import { CycleContraceptiveAction } from '../../../cycles/components/home/CycleQuickActions';
import { estilos as estilosAcoes } from '../../../cycles/components/home/CycleQuickActions.styles';
import { CycleConfidenceSheet } from '../../../cycles/components/sheets/CycleConfidenceSheet';
import { CyclePhaseEducationSheet } from '../../../cycles/components/sheets/CyclePhaseEducationSheet';
import { conteudoPorFase } from '../../../cycles/constants/phaseContent';
import { useCycleDateRange } from '../../../cycles/hooks/useCycleDateRange';
import { criarCycleHomeViewModel } from '../../../cycles/utils/cycleHomeViewModel';
import {
    formatarDataCabecalho,
    obterDiaCiclo,
    obterFase
} from '../../../cycles/utils/cyclePresentation';
import { SharedContentState } from '../../components/SharedContentState/SharedContentState';
import { SharedCareGestures } from '../../components/SharedCareGestures/SharedCareGestures';
import { SharedCycleCareSection } from '../../components/SharedCycleCareSection/SharedCycleCareSection';
import { SharedCycleMomentCard } from '../../components/SharedCycleMomentCard/SharedCycleMomentCard';
import { SupportedCycleHero } from '../../components/SupportedCycleHero/SupportedCycleHero';
import { SupportedPersonIndicator } from '../../components/SupportedPersonIndicator/SupportedPersonIndicator';
import { SharedHomeNotice } from './SharedHomeWithoutContact';
import { estilos } from './SharedHomeScreen.styles';

function SharedHomeScreen({
    nomeTitular,
    permissoes,
    ciclo,
    status,
    aoTentarNovamente,
    onSelecionarAba,
    ferramentasPrevia
}) {
    const { escuro } = useTheme();
    const [dataEscolhida, setDataEscolhida] = useState(null);
    const [faseDoSheet, setFaseDoSheet] = useState(null);
    const [confiabilidadeAberta, setConfiabilidadeAberta] = useState(false);
    const hoje = ciclo?.dataReferencia ?? obterHojeLocal();
    const data = dataEscolhida ?? hoje;
    const verFase = permissoes.includes('geral.fase_atual');
    const verHistorico = permissoes.includes('geral.historico_ciclo');
    const verDicas = permissoes.includes('geral.dicas');
    const verAnticoncepcionais = permissoes.includes('geral.anticoncepcionais');
    const previsao = verFase && verHistorico ? ciclo?.previsao : null;
    const fases = previsao?.fasesEstimadas;
    const duracao = previsao?.duracaoCicloEstimada;
    const faseAtual = ciclo?.faseAtual?.toLowerCase();
    const { dias, carregarDias } = useCycleDateRange({
        dataBase: hoje,
        fases,
        duracaoCiclo: duracao,
        faseAtual
    });
    const fase = verFase && (data === hoje ? faseAtual : obterFase(data, fases, duracao));
    const corDaFase = CORES_FASE[fase] ?? CORES_FASE.desconhecida;
    const modelo = criarCycleHomeViewModel({ previsao, fase, dataSelecionada: data });
    const confiabilidade = modelo.nivelConfiabilidade ?? 'baixa';
    const diaDaPrevisao = obterDiaCiclo(data, fases);
    const diaCiclo =
        previsao && (data === hoje ? (ciclo?.diaDoCiclo ?? diaDaPrevisao) : diaDaPrevisao);
    const dicas = fase && conteudoPorFase[fase];
    const semCiclo = ciclo?.possuiCiclos === false;
    const podeAbrirMomento = verDicas && Boolean(dicas) && !semCiclo;

    return (
        <MainLayout
            titulo={formatarDataCabecalho(data).replace(/ - (\d) de /u, ' - 0$1 de ')}
            varianteHeader="inicio"
            abaAtiva="inicio"
            onSelecionarAba={onSelecionarAba}
            acoesHeader={
                verHistorico ? (
                    <IconButton
                        icone={ClockCounterClockwiseIcon}
                        variante="redeApoio"
                        corIcone={escuro ? coresNoturnasConteudo.coral : '#C85A44'}
                        rotuloAcessibilidade="Ver Histórico de Ciclos"
                        aoPressionar={() => onSelecionarAba('ciclos')}
                    />
                ) : null
            }
        >
            <ScrollView
                contentContainerStyle={estilos.conteudo}
                showsVerticalScrollIndicator={false}
            >
                {verFase ? (
                    <CycleDateStrip
                        dias={dias}
                        dataSelecionada={data}
                        aoCarregarAnteriores={() => carregarDias('anteriores')}
                        aoCarregarPosteriores={() => carregarDias('posteriores')}
                        aoSelecionarData={fases || semCiclo ? setDataEscolhida : undefined}
                        semCiclo={!fases}
                    />
                ) : null}
                {data !== hoje ? (
                    <ReturnToTodayButton onPress={() => setDataEscolhida(null)} />
                ) : null}
                <View style={estilos.identificacao}>
                    <SupportedPersonIndicator nome={nomeTitular} />
                </View>
                {verFase && (status === 'carregando' || status === 'erro') ? (
                    <SharedContentState status={status} aoTentarNovamente={aoTentarNovamente} />
                ) : (
                    <SupportedCycleHero
                        nomeTitular={nomeTitular}
                        fase={fase}
                        possuiDadosCiclo={Boolean(ciclo?.possuiCiclos ?? faseAtual)}
                        exibirFase={verFase}
                        diaCiclo={diaCiclo}
                        duracaoCiclo={duracao}
                    />
                )}
                {verAnticoncepcionais ? (
                    <View style={estilosAcoes.secao}>
                        <CycleContraceptiveAction
                            texto="Ver Anticoncepcionais"
                            larguraTotal
                            aoPressionar={() => onSelecionarAba('anticoncepcionais')}
                        />
                    </View>
                ) : null}
                {verFase && status === 'disponivel' && (dicas || ciclo?.possuiCiclos === false) ? (
                    <SharedCycleMomentCard
                        titulo={
                            semCiclo
                                ? `${nomeTitular} não possui ciclo cadastrado`
                                : NOMES_DAS_FASES[fase]
                        }
                        descricao={
                            podeAbrirMomento
                                ? (dicas.descricao.match(/^[^.]+\./u)?.[0] ?? dicas.descricao)
                                : undefined
                        }
                        aoPressionar={podeAbrirMomento ? () => setFaseDoSheet(fase) : undefined}
                    />
                ) : null}
                {previsao?.proximoInicioEstimado ? (
                    <CyclePredictionSummary
                        confiabilidade={confiabilidade}
                        estimativaIncerta={modelo.previsaoIncerta}
                        aoAbrirConfiabilidade={() => setConfiabilidadeAberta(true)}
                        corDestaque={corDaFase}
                        proximoInicio={previsao.proximoInicioEstimado}
                        ovulacaoEstimada={previsao.dataOvulacaoEstimada}
                        janelaFertil={previsao.janelaFertilEstimada}
                    />
                ) : null}
                {verDicas ? (
                    <>
                        <SharedCycleCareSection nomeTitular={nomeTitular} />
                        <CycleEducationSection
                            perspectiva="contato"
                            corDestaque={corDaFase}
                            estiloSecao={estilos.educacao}
                            rodape={
                                <>
                                    <SharedCareGestures />
                                    <SharedHomeNotice />
                                </>
                            }
                        />
                    </>
                ) : null}
                {!verFase && !verDicas && !verAnticoncepcionais && !verHistorico ? (
                    <SharedContentState />
                ) : null}
                {ferramentasPrevia}
            </ScrollView>
            {previsao?.proximoInicioEstimado ? (
                <CycleConfidenceSheet
                    visivel={confiabilidadeAberta}
                    nivel={confiabilidade}
                    aoFechar={() => setConfiabilidadeAberta(false)}
                />
            ) : null}
            {verFase && verDicas ? (
                <CyclePhaseEducationSheet
                    visivel={Boolean(faseDoSheet)}
                    fase={faseDoSheet ?? fase}
                    rotulo="Conheça o ciclo"
                    aoFechar={() => setFaseDoSheet(null)}
                />
            ) : null}
        </MainLayout>
    );
}

export { SharedHomeScreen };
