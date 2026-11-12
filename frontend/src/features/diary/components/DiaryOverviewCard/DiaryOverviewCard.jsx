// Exibe a fase atual e a contagem segura de dias no topo do histórico do Diário.
import { memo, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterApresentacaoFase } from '../../utils/diaryPhasePresentation';
import { DiaryPhaseIcon } from '../DiaryPhaseIcon/DiaryPhaseIcon';
import { criarEstilos } from './DiaryOverviewCard.styles';

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
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const apresentacao = obterApresentacaoFase(fase);

    if (carregando) {
        return (
            <View
                testID="diary-overview-loading"
                accessibilityLiveRegion="polite"
                style={estilos.cartao}
            >
                <Text style={estilos.cabecalho}>RESUMO DO DIÁRIO</Text>
                <View style={estilos.carregando}>
                    <ActivityIndicator color={tema.cores.interface.destaque} />
                    <Text style={estilos.textoCarregando}>Carregando resumo do Diário...</Text>
                </View>
            </View>
        );
    }

    if (
        !apresentacao ||
        typeof tituloFase !== 'string' ||
        !tituloFase.trim() ||
        typeof descricao !== 'string' ||
        !descricao.trim() ||
        !Number.isSafeInteger(diasRegistrados) ||
        diasRegistrados < 0
    ) {
        return null;
    }

    const { cor } = apresentacao;
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
                    <DiaryPhaseIcon fase={fase} size={48} />
                </View>
                <View style={estilos.textos}>
                    <Text style={estilos.titulo}>
                        Você está na{' '}
                        <Text style={[estilos.fase, { color: cor }]}>{tituloFase.trim()}</Text>
                    </Text>
                    <Text style={estilos.descricao}>{descricao.trim()}</Text>
                </View>
            </View>
            <View testID="diary-overview-footer" style={estilos.rodape}>
                <Text style={estilos.quantidade}>{textoDias}</Text>
            </View>
        </View>
    );
}

const MemoizedDiaryOverviewCard = memo(DiaryOverviewCard);

export { MemoizedDiaryOverviewCard as DiaryOverviewCard };
