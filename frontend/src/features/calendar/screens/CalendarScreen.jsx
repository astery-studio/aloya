// Orquestra calendário, cabeçalho, legenda e estados de erro ou vazio.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { ConfidenceBadge } from '../../../shared/components/common/ConfidenceBadge/ConfidenceBadge';
import { FloatingActionButton } from '../../../shared/components/common/FloatingActionButton';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import { InfoIcon } from '../../../shared/components/icons/AppIcons';
import { EmptyState } from '../../../shared/components/feedback/EmptyState/EmptyState';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { BottomTabBar } from '../../../shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar';
import { CycleCalendar } from '../components/CycleCalendar/CycleCalendar';
import { CycleLegendSheet } from '../components/CycleLegendSheet/CycleLegendSheet';
import { CycleConfidenceSheet } from '../../cycles/components/sheets/CycleConfidenceSheet';
import { useTheme } from '../../../shared/hooks/useTheme';
import { coresConfiabilidadeEscuras, criarEstilos } from './CalendarScreen.styles';
import { SyncStatusIndicator } from '../../cycles/components/SyncStatusIndicator';

const ITENS_LEGENDA = Object.freeze([
    {
        id: 'menstruacao-real',
        tipo: 'menstruacao',
        titulo: 'Menstruação',
        descricao: 'Dias de menstruação',
        prevista: false
    },
    {
        id: 'folicular-real',
        tipo: 'folicular',
        titulo: 'Fase Folicular',
        descricao: 'Período de fase folicular',
        prevista: false
    },
    {
        id: 'ovulacao-real',
        tipo: 'ovulacao',
        titulo: 'Ovulação',
        descricao: 'Período de ovulação',
        prevista: false
    },
    {
        id: 'lutea-real',
        tipo: 'lutea',
        titulo: 'Fase Lútea',
        descricao: 'Período de fase lútea',
        prevista: false
    },
    {
        id: 'janela-real',
        tipo: 'janelaFertil',
        titulo: 'Janela Fértil',
        descricao: 'Dias com maior probabilidade de engravidar',
        prevista: false
    },
    {
        id: 'menstruacao-prevista',
        tipo: 'menstruacao',
        titulo: 'Provável Menstruação',
        descricao: 'Previsão dos dias de menstruação',
        prevista: true
    },
    {
        id: 'folicular-prevista',
        tipo: 'folicular',
        titulo: 'Provável Fase Folicular',
        descricao: 'Previsão do período de fase folicular',
        prevista: true
    },
    {
        id: 'ovulacao-prevista',
        tipo: 'ovulacao',
        titulo: 'Provável Ovulação',
        descricao: 'Previsão do período de ovulação',
        prevista: true
    },
    {
        id: 'lutea-prevista',
        tipo: 'lutea',
        titulo: 'Provável Fase Lútea',
        descricao: 'Previsão de fase lútea',
        prevista: true
    },
    {
        id: 'janela-prevista',
        tipo: 'janelaFertil',
        titulo: 'Provável Janela Fértil',
        descricao: 'Previsão da janela fértil',
        prevista: true
    }
]);

const MENSAGEM_ERRO_CALENDARIO =
    'Não foi possível carregar os dados do calendário. Tente novamente.';
const TEMPO_REAPARECER_AVISO_MS = 5000;
const PRIORIDADE_STATUS_SINCRONIZACAO = Object.freeze(['falha', 'sincronizando', 'pendente']);

function normalizarConfianca(valor) {
    if (typeof valor !== 'string') return null;

    const nivel = valor.trim().toLocaleLowerCase('pt-BR');

    if (nivel === 'alta' || nivel === 'media' || nivel === 'média' || nivel === 'baixa') {
        return nivel === 'média' ? 'media' : nivel;
    }

    return null;
}

function obterStatusSincronizacaoPrioritario(status) {
    const recebidos = Array.isArray(status) ? status : [status];

    return PRIORIDADE_STATUS_SINCRONIZACAO.find((item) => recebidos.includes(item)) ?? null;
}

function CalendarScreen({
    meses = [],
    confianca,
    carregando = false,
    carregandoAnteriores = false,
    carregandoPosteriores = false,
    erro,
    aoCarregarAnteriores,
    aoCarregarPosteriores,
    aoTentarNovamente,
    aoCadastrarMenstruacao,
    aoEditarCiclo,
    statusSincronizacao,
    erroSincronizacao,
    aoTentarSincronizar,
    onSelecionarAba
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [legendaVisivel, setLegendaVisivel] = useState(false);
    const [confiancaVisivel, setConfiancaVisivel] = useState(false);
    const [avisoVazioVisivel, setAvisoVazioVisivel] = useState(false);
    const opacidadeAviso = useRef(new Animated.Value(0)).current;
    const deslocamentoAviso = useRef(new Animated.Value(-10)).current;
    const temporizadorAviso = useRef(null);

    const mesesValidos = Array.isArray(meses) ? meses : [];
    const confiancaValida = normalizarConfianca(confianca);
    const existeErro = typeof erro === 'string' && erro.trim().length > 0;
    const possuiCiclos = mesesValidos.some(
        (mes) => mes?.possuiCiclos === true || mes?.calendario?.possuiCiclos === true
    );
    const estadoVazio = !carregando && !existeErro && mesesValidos.length > 0 && !possuiCiclos;
    const statusSincronizacaoPrioritario = obterStatusSincronizacaoPrioritario(statusSincronizacao);
    const mostrarStatusSincronizacao = !existeErro && Boolean(statusSincronizacaoPrioritario);
    const mostrarAvisoCicloVazio = estadoVazio && !mostrarStatusSincronizacao;
    const mostrarFab = !carregando && !existeErro && typeof aoCadastrarMenstruacao === 'function';

    const animarEntradaAviso = useCallback(() => {
        opacidadeAviso.stopAnimation();
        deslocamentoAviso.stopAnimation();
        opacidadeAviso.setValue(0);
        deslocamentoAviso.setValue(-10);

        Animated.parallel([
            Animated.timing(opacidadeAviso, {
                toValue: 1,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true
            }),
            Animated.timing(deslocamentoAviso, {
                toValue: 0,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true
            })
        ]).start();
    }, [deslocamentoAviso, opacidadeAviso]);

    const animarSaidaAviso = useCallback(() => {
        opacidadeAviso.stopAnimation();
        deslocamentoAviso.stopAnimation();

        Animated.parallel([
            Animated.timing(opacidadeAviso, {
                toValue: 0,
                duration: 180,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true
            }),
            Animated.timing(deslocamentoAviso, {
                toValue: -8,
                duration: 180,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true
            })
        ]).start();
    }, [deslocamentoAviso, opacidadeAviso]);

    const registrarInteracao = useCallback(() => {
        if (!mostrarAvisoCicloVazio) return;

        if (temporizadorAviso.current) {
            clearTimeout(temporizadorAviso.current);
        }

        setAvisoVazioVisivel(false);
        animarSaidaAviso();

        temporizadorAviso.current = setTimeout(() => {
            setAvisoVazioVisivel(true);
            animarEntradaAviso();
            temporizadorAviso.current = null;
        }, TEMPO_REAPARECER_AVISO_MS);
    }, [animarEntradaAviso, animarSaidaAviso, mostrarAvisoCicloVazio]);

    useEffect(() => {
        if (!mostrarAvisoCicloVazio) {
            setAvisoVazioVisivel(false);
            opacidadeAviso.setValue(0);
            deslocamentoAviso.setValue(-10);
            return undefined;
        }

        setAvisoVazioVisivel(true);
        animarEntradaAviso();

        return () => {
            if (temporizadorAviso.current) {
                clearTimeout(temporizadorAviso.current);
                temporizadorAviso.current = null;
            }
        };
    }, [animarEntradaAviso, deslocamentoAviso, mostrarAvisoCicloVazio, opacidadeAviso]);

    return (
        <View testID="calendar-screen" style={estilos.tela} onTouchStart={registrarInteracao}>
            <Header
                titulo="Calendário"
                variante="redeApoio"
                complementoTitulo={
                    confiancaValida && !existeErro ? (
                        <ConfidenceBadge
                            nivel={confiancaValida}
                            variante="simples"
                            estilo={estilos.tagConfianca}
                            onPress={() => setConfiancaVisivel(true)}
                            rotuloAcessibilidade="Explicar confiabilidade do calendário"
                            coresPersonalizadas={
                                tema.escuro
                                    ? coresConfiabilidadeEscuras[confiancaValida]
                                    : undefined
                            }
                        />
                    ) : null
                }
                acoes={
                    <IconButton
                        icone={InfoIcon}
                        aoPressionar={() => setLegendaVisivel(true)}
                        rotuloAcessibilidade="Abrir legenda do calendário"
                        variante="redeApoioSecundario"
                        corIcone={tema.escuro ? undefined : tema.cores.interface.destaque}
                    />
                }
            />

            <View testID="calendar-body" style={estilos.corpo}>
                <View style={estilos.conteudo}>
                    {existeErro ? (
                        <View testID="calendar-error-state" style={estilos.estadoCentral}>
                            <EmptyState
                                titulo="Ocorreu um erro"
                                mensagem={MENSAGEM_ERRO_CALENDARIO}
                                variante="erro"
                                acao={
                                    <ButtonScreen
                                        texto="Tentar Novamente"
                                        aoPressionar={aoTentarNovamente}
                                        variante="preto"
                                        estilo={estilos.botaoEstado}
                                    />
                                }
                            />
                        </View>
                    ) : (
                        <View style={estilos.areaCalendario}>
                            <CycleCalendar
                                meses={mesesValidos}
                                carregando={carregando}
                                carregandoAnteriores={carregandoAnteriores}
                                carregandoPosteriores={carregandoPosteriores}
                                aoCarregarAnteriores={aoCarregarAnteriores}
                                aoCarregarPosteriores={aoCarregarPosteriores}
                                aoPressionarDia={aoEditarCiclo}
                            />

                            {mostrarStatusSincronizacao ? (
                                <View
                                    testID="status-sincronizacao-calendario"
                                    style={estilos.areaSincronizacao}
                                >
                                    <SyncStatusIndicator
                                        variante="calendario"
                                        status={statusSincronizacaoPrioritario}
                                        mensagem={
                                            statusSincronizacaoPrioritario === 'falha' &&
                                            erroSincronizacao?.status
                                                ? erroSincronizacao.mensagemUsuario
                                                : undefined
                                        }
                                        onTentarNovamente={aoTentarSincronizar}
                                    />
                                </View>
                            ) : mostrarAvisoCicloVazio ? (
                                <Animated.View
                                    pointerEvents="box-none"
                                    style={[
                                        estilos.posicionadorAvisoVazio,
                                        {
                                            opacity: opacidadeAviso,
                                            transform: [{ translateY: deslocamentoAviso }]
                                        }
                                    ]}
                                >
                                    <View
                                        testID="calendar-empty-state"
                                        accessibilityRole="alert"
                                        accessibilityElementsHidden={!avisoVazioVisivel}
                                        importantForAccessibility={
                                            avisoVazioVisivel ? 'yes' : 'no-hide-descendants'
                                        }
                                        style={estilos.avisoVazio}
                                    >
                                        <Text style={estilos.textoVazio}>
                                            Você ainda não possui nenhum ciclo registrado. Toque em{' '}
                                            <Text style={estilos.textoDestaque}>{"'+'"}</Text> pra
                                            começar.
                                        </Text>
                                    </View>
                                </Animated.View>
                            ) : null}
                        </View>
                    )}
                </View>

                {mostrarFab ? (
                    <FloatingActionButton
                        rotuloAcessibilidade="Cadastrar menstruação"
                        aoPressionar={aoCadastrarMenstruacao}
                        considerarAreaSeguraInferior={false}
                        deslocamentoInferior={0}
                        testID="calendar-add-fab"
                    />
                ) : null}
            </View>

            <SafeAreaView
                testID="calendar-bottom-navigation"
                edges={['bottom']}
                style={estilos.navegacaoSegura}
            >
                <BottomTabBar abaAtiva="calendario" onSelecionar={onSelecionarAba} />
            </SafeAreaView>

            <CycleLegendSheet
                visivel={legendaVisivel}
                itens={ITENS_LEGENDA}
                aoFechar={() => setLegendaVisivel(false)}
            />

            <CycleConfidenceSheet
                visivel={confiancaVisivel}
                nivel={confiancaValida}
                aoFechar={() => setConfiancaVisivel(false)}
            />
        </View>
    );
}

export {
    CalendarScreen,
    ITENS_LEGENDA,
    MENSAGEM_ERRO_CALENDARIO,
    PRIORIDADE_STATUS_SINCRONIZACAO,
    TEMPO_REAPARECER_AVISO_MS,
    normalizarConfianca,
    obterStatusSincronizacaoPrioritario
};
export default CalendarScreen;
