import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import {
    ClockCounterClockwiseIcon,
    HeartIcon,
    PillIcon,
    QuestionIcon,
    ShieldCheckIcon,
    SparkleIcon
} from '../../../../shared/components/icons/AppIcons';
import { MainLayout } from '../../../../shared/layouts/MainLayout/MainLayout';
import { obterHojeLocal } from '../../../calendar/utils/cycleCalendar.utils';
import { CycleDateStrip } from '../../../cycles/components/CycleDateStrip';
import { CycleEducationSection } from '../../../cycles/components/CycleEducationSection';
import { CycleExpandableCard } from '../../../cycles/components/CycleExpandableCard';
import { NOMES_DAS_FASES } from '../../../cycles/components/home/CyclePhaseHero';
import { CORES_FASE } from '../../../cycles/components/home/CyclePhaseHero.styles';
import { CyclePredictionSummary } from '../../../cycles/components/home/CyclePredictionSummary';
import { conteudoPorFase } from '../../../cycles/constants/phaseContent';
import {
    criarDiasDaFaixa,
    formatarDataCabecalho,
    obterDiaCiclo
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
    const dias = criarDiasDaFaixa(hoje, fases, -7, 22, duracao).map((dia) =>
        dia.data === hoje && faseAtual ? { ...dia, fase: faseAtual } : dia
    );
    const fase = verFase ? dias.find((dia) => dia.data === data)?.fase : null;
    const corDaFase = CORES_FASE[fase] ?? CORES_FASE.desconhecida;
    const diaNaFaixa = obterDiaCiclo(data, fases);
    const diaCiclo =
        verFase && verHistorico
            ? data === hoje
                ? ciclo?.diaDoCiclo
                : diaNaFaixa && diaNaFaixa <= duracao
                  ? diaNaFaixa
                  : null
            : null;
    const dicas = fase && conteudoPorFase[fase];
    const semCiclo = ciclo?.possuiCiclos === false;
    const seloEducativo = <Text style={estilos.selo}>Informação educativa</Text>;

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
                        aoSelecionarData={
                            fases || !ciclo?.possuiCiclos ? setDataEscolhida : undefined
                        }
                        semCiclo={!fases}
                    />
                ) : null}
                <SupportedPersonIndicator nome={nomeTitular} />
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
                    <View style={estilos.margem}>
                        <ButtonScreen
                            texto="Ver Anticoncepcionais"
                            variante="verde"
                            icone={PillIcon}
                            estilo={estilos.botaoAnticoncepcionais}
                            aoPressionar={() => onSelecionarAba('anticoncepcionais')}
                        />
                    </View>
                ) : null}
                {verFase && status === 'disponivel' && (dicas || ciclo?.possuiCiclos === false) ? (
                    <View style={estilos.margem}>
                        {!semCiclo && verDicas ? (
                            <CycleExpandableCard
                                rotulo="Momento do ciclo"
                                corRotulo={corDaFase}
                                selo={seloEducativo}
                                titulo={NOMES_DAS_FASES[fase]}
                                subtitulo={
                                    dicas.descricao.match(/^[^.]+\./u)?.[0] ?? dicas.descricao
                                }
                            >
                                <Text style={estilos.descricao}>{dicas?.descricao}</Text>
                            </CycleExpandableCard>
                        ) : (
                            <View style={estilos.gesto}>
                                <View style={estilos.linhaRotulo}>
                                    <Text style={estilos.rotulo}>MOMENTO DO CICLO</Text>
                                    {verDicas ? seloEducativo : null}
                                </View>
                                <Text style={estilos.tituloMomento}>
                                    {semCiclo
                                        ? `${nomeTitular} não possui ciclo cadastrado`
                                        : NOMES_DAS_FASES[fase]}
                                </Text>
                            </View>
                        )}
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
                        <View style={[estilos.margem, estilos.secao]}>
                            <Text style={estilos.rotulo}>CUIDADO RESPEITOSO</Text>
                            <Text accessibilityRole="header" style={estilos.titulo}>
                                Como oferecer apoio hoje?
                            </Text>
                            <Text style={estilos.descricao}>
                                Pequenos gestos podem fazer diferença. Descubra sugestões para
                                cuidar com respeito, atenção e gentileza.
                            </Text>
                            {orientacoes.map(([titulo, texto, Icone]) => (
                                <CycleExpandableCard
                                    key={titulo}
                                    titulo={titulo}
                                    subtitulo="Toque para explorar"
                                    icone={
                                        <View style={estilos.caixaIcone}>
                                            <Icone size={21} color="#C85A44" />
                                        </View>
                                    }
                                >
                                    <Text style={estilos.descricao}>{texto}</Text>
                                </CycleExpandableCard>
                            ))}
                        </View>
                        <CycleEducationSection
                            perspectiva="contato"
                            rodape={
                                <View style={estilos.secao}>
                                    <Text style={estilos.rotulo}>PARA QUALQUER MOMENTO</Text>
                                    <Text accessibilityRole="header" style={estilos.titulo}>
                                        Pequenos gestos, muito cuidado.
                                    </Text>
                                    <View style={estilos.grade}>
                                        {GESTOS.map(([titulo, Icone]) => (
                                            <View
                                                key={titulo}
                                                style={[estilos.gesto, estilos.itemGrade]}
                                            >
                                                <View style={estilos.caixaIcone}>
                                                    <Icone size={18} color="#C85A44" />
                                                </View>
                                                <Text style={estilos.tituloGesto}>{titulo}</Text>
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
        </MainLayout>
    );
}

export { SharedHomeScreen };
