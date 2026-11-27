import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import {
    ClockCounterClockwiseIcon,
    HeartIcon,
    QuestionIcon,
    ShieldCheckIcon,
    SparkleIcon
} from '../../../../shared/components/icons/AppIcons';
import { MainLayout } from '../../../../shared/layouts/MainLayout/MainLayout';
import { obterHojeLocal } from '../../../calendar/utils/cycleCalendar.utils';
import { CycleDateStrip } from '../../../cycles/components/CycleDateStrip';
import { CycleEducationSection } from '../../../cycles/components/CycleEducationSection';
import { ReturnToTodayButton } from '../../../cycles/components/ReturnToTodayButton';
import { estilos as estilosCuidados } from '../../../cycles/components/home/CycleCareSection.styles';
import { CycleHomeCard } from '../../../cycles/components/home/CycleHomeCard';
import { NOMES_DAS_FASES } from '../../../cycles/components/home/CyclePhaseHero';
import { CORES_FASE } from '../../../cycles/components/home/CyclePhaseHero.styles';
import { CyclePredictionSummary } from '../../../cycles/components/home/CyclePredictionSummary';
import { CycleContraceptiveAction } from '../../../cycles/components/home/CycleQuickActions';
import { estilos as estilosAcoes } from '../../../cycles/components/home/CycleQuickActions.styles';
import { CyclePhaseEducationSheet } from '../../../cycles/components/sheets/CyclePhaseEducationSheet';
import { conteudoPorFase } from '../../../cycles/constants/phaseContent';
import { useCycleDateRange } from '../../../cycles/hooks/useCycleDateRange';
import {
    formatarDataCabecalho,
    obterDiaCiclo,
    obterFase
} from '../../../cycles/utils/cyclePresentation';
import { SharedContentState } from '../../components/SharedContentState/SharedContentState';
import { SupportedCycleHero } from '../../components/SupportedCycleHero/SupportedCycleHero';
import { SupportedPersonIndicator } from '../../components/SupportedPersonIndicator/SupportedPersonIndicator';
import { SharedHomeNotice } from './SharedHomeWithoutContact';
import { estilos } from './SharedHomeScreen.styles';

const GESTOS = [
    ['Escutar', HeartIcon],
    ['Perguntar', QuestionIcon],
    ['Respeitar', ShieldCheckIcon],
    ['Ajudar', SparkleIcon]
];

function SharedHomeScreen({
    nomeTitular,
    permissoes,
    ciclo,
    status,
    aoTentarNovamente,
    onSelecionarAba,
    ferramentasPrevia
}) {
    const [dataEscolhida, setDataEscolhida] = useState(null);
    const [faseDoSheet, setFaseDoSheet] = useState(null);
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
    const diaDaPrevisao = obterDiaCiclo(data, fases);
    const diaCiclo =
        previsao && (data === hoje ? (ciclo?.diaDoCiclo ?? diaDaPrevisao) : diaDaPrevisao);
    const dicas = fase && conteudoPorFase[fase];
    const semCiclo = ciclo?.possuiCiclos === false;
    const podeAbrirMomento = verDicas && Boolean(dicas) && !semCiclo;

    const orientacoes = [
        [
            `Pergunte como ${nomeTitular} está`,
            'Cada menstruação é diferente. Perguntar como a pessoa está se sentindo é uma boa forma de entender se ela precisa de alguma coisa.',
            QuestionIcon
        ],
        [
            'Ofereça ajuda prática',
            'Se houver desconforto ou cansaço, ofereça ajuda com pequenas tarefas.',
            HeartIcon
        ],
        [
            'Respeite o ritmo',
            'Algumas pessoas preferem descansar, outras mantêm sua rotina normalmente. O mais importante é respeitar suas escolhas.',
            ShieldCheckIcon
        ]
    ];

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
                        corIcone="#C85A44"
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
                    <View style={estilosCuidados.secao}>
                        <CycleHomeCard
                            categoria="Momento do ciclo"
                            corCategoria={corDaFase}
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
                            selo={
                                podeAbrirMomento ? (
                                    <Text style={estilos.selo}>Informação autorizada</Text>
                                ) : null
                            }
                            rotuloAcessibilidade={
                                podeAbrirMomento
                                    ? `Momento do ciclo. ${NOMES_DAS_FASES[fase]}. Informação autorizada`
                                    : undefined
                            }
                            aoPressionar={podeAbrirMomento ? () => setFaseDoSheet(fase) : undefined}
                        />
                    </View>
                ) : null}
                {previsao?.proximoInicioEstimado ? (
                    <CyclePredictionSummary
                        nomeTitular={nomeTitular}
                        corDestaque={corDaFase}
                        proximoInicio={previsao.proximoInicioEstimado}
                        ovulacaoEstimada={previsao.dataOvulacaoEstimada}
                        janelaFertil={previsao.janelaFertilEstimada}
                    />
                ) : null}
                {verDicas ? (
                    <>
                        <View style={estilosCuidados.secao}>
                            <Text style={[estilosCuidados.etiqueta, { color: corDaFase }]}>
                                Cuidado respeitoso
                            </Text>
                            <Text accessibilityRole="header" style={estilosCuidados.tituloSecao}>
                                Como oferecer apoio hoje?
                            </Text>
                            <Text style={estilosCuidados.descricao}>
                                Pequenos gestos podem fazer diferença. Descubra sugestões para
                                cuidar com respeito, atenção e gentileza.
                            </Text>
                            <View style={estilosCuidados.lista}>
                                {orientacoes.map(([titulo, texto, Icone]) => (
                                    <CycleHomeCard
                                        key={titulo}
                                        titulo={titulo}
                                        descricao="Toque para explorar"
                                        icone={
                                            <View style={estilos.caixaIcone}>
                                                <Icone size={21} color="#C85A44" />
                                            </View>
                                        }
                                    >
                                        <Text style={estilosCuidados.descricao}>{texto}</Text>
                                    </CycleHomeCard>
                                ))}
                            </View>
                        </View>
                        <CycleEducationSection
                            perspectiva="contato"
                            corDestaque={corDaFase}
                            estiloSecao={estilos.educacao}
                            rodape={
                                <View style={estilos.rodape}>
                                    <Text style={[estilosCuidados.etiqueta, { color: corDaFase }]}>
                                        Para qualquer momento
                                    </Text>
                                    <Text
                                        accessibilityRole="header"
                                        style={estilosCuidados.tituloSecao}
                                    >
                                        Pequenos gestos, muito cuidado.
                                    </Text>
                                    <View style={estilos.grade}>
                                        {GESTOS.map(([titulo, Icone]) => (
                                            <View
                                                key={titulo}
                                                style={[estilosCuidados.card, estilos.itemGrade]}
                                            >
                                                <View style={estilos.caixaIcone}>
                                                    <Icone size={18} color="#C85A44" />
                                                </View>
                                                <Text style={estilosCuidados.titulo}>{titulo}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <SharedHomeNotice />
                                </View>
                            }
                        />
                    </>
                ) : null}
                {!verFase && !verDicas && !verAnticoncepcionais && !verHistorico ? (
                    <SharedContentState />
                ) : null}
                {ferramentasPrevia}
            </ScrollView>
            {verFase && verDicas ? (
                <CyclePhaseEducationSheet
                    visivel={Boolean(faseDoSheet)}
                    fase={faseDoSheet ?? fase}
                    aoFechar={() => setFaseDoSheet(null)}
                />
            ) : null}
        </MainLayout>
    );
}

export { SharedHomeScreen };
