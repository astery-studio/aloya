import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import {
    ClockCounterClockwiseIcon,
    WarningCircleIcon
} from '../../../shared/components/icons/AppIcons';
import { BottomTabBar } from '../../../shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar';
import { useTheme } from '../../../shared/hooks/useTheme';
import { CycleDateStrip } from '../components/CycleDateStrip';
import { CycleHomeContent } from '../components/home/CycleHomeContent';
import { NoCycleHomeContent } from '../components/home/NoCycleHomeContent';
import { CycleHomeSheets } from '../components/sheets/CycleHomeSheets';
import { ReturnToTodayButton } from '../components/ReturnToTodayButton';
import { conteudoPorFase } from '../constants/phaseContent';
import { obterHojeLocal } from '../../calendar/utils/cycleCalendar.utils';
import { criarCycleHomeViewModel } from '../utils/cycleHomeViewModel';
import {
    criarDiasDaFaixa,
    formatarDataCabecalho,
    obterDiaCiclo,
    obterFase
} from '../utils/cyclePresentation';
import { criarEstilos } from './CycleTodayScreen.styles';

const CONFIGURACOES_ERRO = Object.freeze({
    previsao: Object.freeze({
        titulo: 'Algo deu errado',
        mensagem: 'Não foi possível carregar sua previsão no momento. Tente novamente.'
    }),
    sincronizacao: Object.freeze({
        titulo: 'Algo deu errado',
        mensagem: 'Não foi possível sincronizar alguns registros. Verifique sua conexão.'
    })
});
const DIAS_POR_PAGINA = 14;
const FAIXA_INICIAL = Object.freeze({ deslocamentoInicial: -3, quantidade: 16 });

function CycleTodayScreen({
    ciclo,
    previsao,
    conteudoDaFase,
    janelaFertil,
    carregando = false,
    erro = false,
    erroPrevisao = false,
    erroSincronizacao = false,
    dataAtual,
    dataSelecionada,
    aoSelecionarData,
    aoTentarNovamente,
    aoVoltar,
    aoCadastrarMenstruacao,
    aoCadastrarDiario,
    aoAbrirAnticoncepcional,
    aoAbrirHistorico,
    aoSelecionarAba,
    diaryService,
    onSessaoExpirada
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const corCarregamento = tema.escuro
        ? tema.cores.interface.destaque
        : tema.cores.marca.secundaria;
    const [faixaDias, setFaixaDias] = useState({ dataBase: null, ...FAIXA_INICIAL });
    const [sheetAberto, setSheetAberto] = useState(null);
    const dataBaseDaFaixa =
        dataAtual || previsao?.dataReferencia || ciclo?.dataReferencia || obterHojeLocal();
    const referencia = dataSelecionada || dataBaseDaFaixa;
    const fases = previsao?.fasesEstimadas || ciclo?.fasesEstimadas || ciclo?.fases;
    const fase = referencia
        ? obterFase(referencia, fases, previsao?.duracaoCicloEstimada)
        : 'desconhecida';
    const faixaAtual =
        faixaDias.dataBase === dataBaseDaFaixa
            ? faixaDias
            : { dataBase: dataBaseDaFaixa, ...FAIXA_INICIAL };
    const { deslocamentoInicial, quantidade } = faixaAtual;
    const duracaoCiclo = previsao?.duracaoCicloEstimada;
    const dias = useMemo(
        () =>
            dataBaseDaFaixa
                ? criarDiasDaFaixa(
                      dataBaseDaFaixa,
                      fases,
                      deslocamentoInicial,
                      quantidade,
                      duracaoCiclo
                  )
                : [],
        [dataBaseDaFaixa, fases, deslocamentoInicial, quantidade, duracaoCiclo]
    );
    const carregarDias = (direcao) =>
        setFaixaDias((atual) => {
            const base =
                atual.dataBase === dataBaseDaFaixa
                    ? atual
                    : { dataBase: dataBaseDaFaixa, ...FAIXA_INICIAL };
            return {
                ...base,
                deslocamentoInicial:
                    direcao === 'anteriores'
                        ? base.deslocamentoInicial - DIAS_POR_PAGINA
                        : base.deslocamentoInicial,
                quantidade: base.quantidade + DIAS_POR_PAGINA
            };
        });
    const home = criarCycleHomeViewModel({
        previsao,
        fase,
        dataSelecionada: referencia,
        janelaFertil
    });
    const semPrevisao = home.estado !== 'comCiclo';
    const tipoErro = erroSincronizacao ? 'sincronizacao' : erroPrevisao || erro ? 'previsao' : null;
    const configuracaoErro = CONFIGURACOES_ERRO[tipoErro] || CONFIGURACOES_ERRO.previsao;
    const fecharSheet = () => setSheetAberto(null);
    const callbacksHome = {
        aoCadastrarMenstruacao,
        aoAbrirDiario: aoCadastrarDiario,
        aoAbrirAnticoncepcional,
        aoAbrirConfiabilidade: () => setSheetAberto('confiabilidade'),
        aoAbrirRespiracao: () => setSheetAberto('respiracao'),
        aoAbrirReflexao: () => setSheetAberto('reflexao'),
        aoAbrirEducacao: () => setSheetAberto('educacao')
    };
    const modeloHome = {
        ...home,
        dataSelecionada: referencia,
        diaCiclo: obterDiaCiclo(referencia, fases),
        janelaFertil,
        previsao,
        conteudoDaFase: conteudoDaFase ?? conteudoPorFase[fase]
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={estilos.tela}>
            <View style={estilos.cabecalho}>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    {formatarDataCabecalho(referencia)}
                </Text>
                <View style={estilos.acoesCabecalho}>
                    <IconButton
                        icone={ClockCounterClockwiseIcon}
                        aoPressionar={aoAbrirHistorico}
                        rotuloAcessibilidade="Abrir histórico do ciclo"
                        variante="calendario"
                    />
                </View>
            </View>
            {carregando ? (
                <View accessibilityLiveRegion="polite" style={estilos.carregando}>
                    <ActivityIndicator size="large" color={corCarregamento} />
                    <Text style={estilos.textoCarregando}>Carregando sua previsão...</Text>
                </View>
            ) : (
                <ScrollView
                    testID="conteudo-rolavel"
                    style={estilos.areaRolagem}
                    contentContainerStyle={estilos.rolagem}
                    showsVerticalScrollIndicator={false}
                >
                    {dias.length ? (
                        <CycleDateStrip
                            dias={dias}
                            dataSelecionada={referencia}
                            aoSelecionarData={aoSelecionarData}
                            aoCarregarAnteriores={() => carregarDias('anteriores')}
                            aoCarregarPosteriores={() => carregarDias('posteriores')}
                            semCiclo={semPrevisao}
                        />
                    ) : null}
                    {referencia !== dataBaseDaFaixa ? (
                        <ReturnToTodayButton onPress={() => aoSelecionarData?.(dataBaseDaFaixa)} />
                    ) : null}
                    {!semPrevisao ? (
                        <CycleHomeContent
                            modelo={modeloHome}
                            callbacks={callbacksHome}
                            diaryService={diaryService}
                            onSessaoExpirada={onSessaoExpirada}
                        />
                    ) : (
                        <NoCycleHomeContent
                            motivoSemPrevisao={
                                home.estado === 'dadosInsuficientes'
                                    ? 'dadosInsuficientes'
                                    : 'primeiroUso'
                            }
                            {...callbacksHome}
                        />
                    )}
                </ScrollView>
            )}
            <SafeAreaView edges={['bottom']} style={estilos.navegacaoSegura}>
                <BottomTabBar abaAtiva="inicio" onSelecionar={aoSelecionarAba} />
            </SafeAreaView>
            <SimpleModal
                erroInterno
                visivel={!carregando && Boolean(tipoErro)}
                aoFechar={aoVoltar}
                icone={WarningCircleIcon}
                corIcone={tema.cores.feedback.erro}
                fundoIcone={tema.cores.interface.fundo}
                titulo={configuracaoErro.titulo}
                mensagem={configuracaoErro.mensagem}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: aoTentarNovamente
                }}
                acaoSecundaria={{ texto: 'Voltar', variante: 'branco', aoPressionar: aoVoltar }}
            />
            <CycleHomeSheets
                aberto={sheetAberto}
                nivel={home.nivelConfiabilidade ?? 'baixa'}
                fase={fase}
                data={referencia}
                diaryService={diaryService}
                onSessaoExpirada={onSessaoExpirada}
                aoFechar={fecharSheet}
            />
        </SafeAreaView>
    );
}

export { CONFIGURACOES_ERRO, CycleTodayScreen };
