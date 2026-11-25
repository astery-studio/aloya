// Orquestra calendário, cabeçalho, legenda e estados de erro ou vazio.
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfidenceBadge } from '../../../shared/components/common/ConfidenceBadge/ConfidenceBadge';
import { FloatingActionButton } from '../../../shared/components/common/FloatingActionButton';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import { InfoIcon } from '../../../shared/components/icons/AppIcons';
import { EmptyState } from '../../../shared/components/feedback/EmptyState/EmptyState';
import AlertModal from '../../../shared/components/feedback/Modal/AlertModal/AlertModal';
import { Header } from '../../../shared/components/navigation/Header/Header';
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

function normalizarConfianca(valor) {
    if (typeof valor !== 'string') return null;

    const nivel = valor.trim().toLocaleLowerCase('pt-BR');

    if (nivel === 'alta' || nivel === 'media' || nivel === 'média' || nivel === 'baixa') {
        return nivel === 'média' ? 'media' : nivel;
    }

    return null;
}

function ErroCalendario({ erro, aoTentarNovamente }) {
    const [fechado, setFechado] = useState(false);

    function tentarNovamente() {
        if (typeof aoTentarNovamente === 'function') {
            aoTentarNovamente();
        } else {
            setFechado(true);
        }
    }

    return (
        <AlertModal
            erroInterno
            visivel={!fechado}
            titulo="Não foi possível carregar o calendário"
            mensagem={erro}
            acaoPrincipal={{
                texto: typeof aoTentarNovamente === 'function' ? 'Tentar novamente' : 'Fechar',
                aoPressionar: tentarNovamente
            }}
            aoFechar={() => setFechado(true)}
        />
    );
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
    aoTentarSincronizar
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [legendaVisivel, setLegendaVisivel] = useState(false);
    const [confiancaVisivel, setConfiancaVisivel] = useState(false);

    const mesesValidos = Array.isArray(meses) ? meses : [];
    const confiancaValida = normalizarConfianca(confianca);
    const existeErro = typeof erro === 'string' && erro.trim().length > 0;
    const possuiCiclos = mesesValidos.some(
        (mes) => mes?.possuiCiclos === true || mes?.calendario?.possuiCiclos === true
    );
    const estadoVazio = !carregando && !existeErro && mesesValidos.length > 0 && !possuiCiclos;
    const mostrarFab = !carregando && !existeErro && typeof aoCadastrarMenstruacao === 'function';

    return (
        <View style={estilos.tela}>
            <Header
                titulo="Calendário"
                variante="redeApoio"
                complementoTitulo={
                    confiancaValida ? (
                        <ConfidenceBadge
                            nivel={confiancaValida}
                            variante="simples"
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
                        variante="redeApoio"
                        corIcone={tema.cores.interface.destaque}
                    />
                }
            />

            <View style={estilos.conteudo}>
                {estadoVazio ? (
                    <View testID="calendar-empty-state" style={estilos.estadoVazio}>
                        <EmptyState
                            titulo="Nenhum ciclo registrado"
                            mensagem={
                                <>
                                    Você ainda não possui nenhum ciclo registrado. Toque em{' '}
                                    <Text style={estilos.textoDestaque}>
                                        {"'Cadastrar Menstruação'"}
                                    </Text>{' '}
                                    para começar.
                                </>
                            }
                            variante="vazio"
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
                    </View>
                )}
            </View>

            <SafeAreaView testID="rodape-calendario" edges={['bottom']} style={estilos.rodape}>
                <SyncStatusIndicator
                    status={statusSincronizacao}
                    mensagem={
                        statusSincronizacao === 'falha' && erroSincronizacao?.status
                            ? erroSincronizacao.mensagemUsuario
                            : undefined
                    }
                    onTentarNovamente={aoTentarSincronizar}
                />
            </SafeAreaView>

            {mostrarFab ? (
                <FloatingActionButton
                    rotuloAcessibilidade="Cadastrar menstruação"
                    aoPressionar={aoCadastrarMenstruacao}
                />
            ) : null}

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

            {existeErro ? (
                <ErroCalendario key={erro} erro={erro} aoTentarNovamente={aoTentarNovamente} />
            ) : null}
        </View>
    );
}

export { CalendarScreen, ITENS_LEGENDA, normalizarConfianca };
export default CalendarScreen;
