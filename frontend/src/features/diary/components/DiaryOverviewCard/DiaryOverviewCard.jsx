// Exibe a fase atual e a contagem segura de dias no topo do histórico do Diário.
import { memo, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterCoresDiario } from '../../config/diaryColors';
import { obterApresentacaoFase } from '../../utils/diaryPhasePresentation';
import { DiaryPhaseIcon } from '../DiaryPhaseIcon/DiaryPhaseIcon';
import { criarEstilos } from './DiaryOverviewCard.styles';

const APRESENTACAO_RESUMO_FASE = Object.freeze({
    menstruacao: {
        corIcone: '#C85A44',
        corTexto: '#C85A44',
        corTextoContador: 'rgba(200, 90, 68, 0.80)',
        corFundoContador: 'rgba(200, 90, 68, 0.20)'
    },
    lutea: {
        corIcone: '#D68C3A',
        corTexto: '#D68C3A',
        corTextoContador: 'rgba(214, 140, 58, 0.80)',
        corFundoContador: 'rgba(214, 140, 58, 0.20)'
    },
    folicular: {
        corIcone: '#567062',
        corTexto: '#2C4C3B',
        corTextoContador: 'rgba(44, 76, 59, 0.80)',
        corFundoContador: 'rgba(44, 76, 59, 0.20)'
    },
    ovulacao: {
        corIcone: '#4A758E',
        corTexto: '#4A758E',
        corTextoContador: 'rgba(74, 117, 142, 0.80)',
        corFundoContador: 'rgba(74, 117, 142, 0.20)'
    }
});

const ALIASES_FASE_RESUMO = Object.freeze({
    menstrual: 'menstruacao',
    ovulatoria: 'ovulacao'
});

function obterApresentacaoResumoFase(fase, tema) {
    if (tema?.escuro) {
        const faseEscura = obterApresentacaoFase(fase, tema);
        return faseEscura
            ? {
                  corIcone: faseEscura.cor,
                  corTexto: faseEscura.cor,
                  corTextoContador: faseEscura.textoContador,
                  corFundoContador: faseEscura.fundo
              }
            : null;
    }
    return APRESENTACAO_RESUMO_FASE[ALIASES_FASE_RESUMO[fase] ?? fase] ?? null;
}

// Recebe somente dados já autorizados e retorna o cartão de resumo ou nada quando inválido.
function DiaryOverviewCard({
    fase,
    tituloFase,
    descricao,
    diasRegistrados,
    contagemParcial = false,
    carregando = false
}) {
    const tema = useTheme();
    const coresDiario = obterCoresDiario(tema);
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const apresentacao = obterApresentacaoFase(fase, tema);
    const apresentacaoResumo = obterApresentacaoResumoFase(fase, tema);

    if (carregando) {
        return (
            <View
                testID="diary-overview-loading"
                accessibilityLiveRegion="polite"
                style={estilos.cartao}
            >
                <Text style={estilos.cabecalho}>RESUMO DO DIÁRIO</Text>
                <View style={estilos.carregando}>
                    <ActivityIndicator color={coresDiario.interface.destaque} />
                    <Text style={estilos.textoCarregando}>Carregando resumo do Diário...</Text>
                </View>
            </View>
        );
    }

    if (
        !apresentacao ||
        !apresentacaoResumo ||
        typeof tituloFase !== 'string' ||
        !tituloFase.trim() ||
        typeof descricao !== 'string' ||
        !descricao.trim() ||
        !Number.isSafeInteger(diasRegistrados) ||
        diasRegistrados < 0
    ) {
        return null;
    }

    const textoDias = `${diasRegistrados}${contagemParcial ? '+' : ''} ${
        diasRegistrados === 1 && !contagemParcial ? 'dia registrado' : 'dias registrados'
    }`;
    const descricaoAcessivel = descricao.trim().replace(/[.!?]+$/u, '');

    return (
        <View
            testID="diary-overview-card"
            accessible
            accessibilityLabel={`${tituloFase.trim()}. ${descricaoAcessivel}. ${textoDias}.`}
            style={estilos.cartao}
        >
            <Text testID="diary-overview-header" style={estilos.cabecalho}>
                RESUMO DO DIÁRIO
            </Text>
            <View testID="diary-overview-content" style={estilos.conteudo}>
                <View
                    testID="diary-overview-icon"
                    style={estilos.areaIcone}
                    importantForAccessibility="no-hide-descendants"
                >
                    <DiaryPhaseIcon fase={fase} size={48} cor={apresentacaoResumo.corIcone} />
                </View>
                <View style={estilos.textos}>
                    <Text
                        testID="diary-overview-title"
                        style={[estilos.titulo, { color: apresentacaoResumo.corTexto }]}
                    >
                        Você está na{' '}
                        <Text
                            testID="diary-overview-phase"
                            style={[estilos.fase, { color: apresentacaoResumo.corTexto }]}
                        >
                            {tituloFase.trim()}
                        </Text>
                    </Text>
                    <Text style={estilos.descricao}>{descricao.trim()}</Text>
                </View>
            </View>
            <View testID="diary-overview-footer" style={estilos.rodape}>
                <View
                    testID="diary-overview-day-counter"
                    style={[
                        estilos.contadorDias,
                        { backgroundColor: apresentacaoResumo.corFundoContador }
                    ]}
                >
                    <Text
                        style={[estilos.quantidade, { color: apresentacaoResumo.corTextoContador }]}
                    >
                        {textoDias}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const MemoizedDiaryOverviewCard = memo(DiaryOverviewCard);

export {
    APRESENTACAO_RESUMO_FASE,
    MemoizedDiaryOverviewCard as DiaryOverviewCard,
    obterApresentacaoResumoFase
};
