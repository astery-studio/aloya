import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { FilterChip } from '../../../../shared/components/common/FilterChip/FilterChip';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterCoresDiario } from '../../config/diaryColors';
import { formatarDataFiltro } from '../../utils/diaryFilters';
import { obterApresentacaoFase } from '../../utils/diaryPhasePresentation';
import { criarEstilos } from './DiaryActiveFilters.styles';

function criarDescritoresFiltros(filtros, rotulosCategorias = {}) {
    const descritores = [];
    if (filtros?.dataInicio) {
        descritores.push({
            id: 'dataInicio',
            rotulo: `Desde ${formatarDataFiltro(filtros.dataInicio)}`
        });
    }
    if (filtros?.dataFim) {
        descritores.push({ id: 'dataFim', rotulo: `Até ${formatarDataFiltro(filtros.dataFim)}` });
    }
    for (const fase of filtros?.fases ?? []) {
        const apresentacao = obterApresentacaoFase(fase);
        if (apresentacao) descritores.push({ id: `fase:${fase}`, rotulo: apresentacao.rotulo });
    }
    for (const categoria of filtros?.categorias ?? []) {
        descritores.push({
            id: `categoria:${categoria}`,
            rotulo: rotulosCategorias[categoria] ?? categoria
        });
    }
    return descritores;
}

function DiaryActiveFilters({
    filtros,
    rotulosCategorias,
    quantidadeResultados,
    aoRemover,
    aoLimpar
}) {
    const tema = useTheme();
    const coresDiario = obterCoresDiario(tema);
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const descritores = criarDescritoresFiltros(filtros, rotulosCategorias);
    if (descritores.length === 0) return null;

    return (
        <View testID="filtros-ativos-diario" style={estilos.container}>
            <ButtonScreen
                texto="Limpar filtros"
                variante="branco"
                aoPressionar={aoLimpar}
                estilo={estilos.botaoLimpar}
                estiloTexto={estilos.textoLimpar}
            />
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={estilos.lista}
            >
                {descritores.map((filtro) => (
                    <FilterChip
                        key={filtro.id}
                        rotulo={filtro.rotulo}
                        aoRemover={() => aoRemover?.(filtro.id)}
                        cor={coresDiario.primaria}
                        fundo={coresDiario.interface.fundo}
                    />
                ))}
            </ScrollView>
            <View style={estilos.divisor}>
                <View style={estilos.linha} />
                <Text style={estilos.textoDivisor}>
                    FILTRO APLICADO (
                    {Number.isSafeInteger(quantidadeResultados) ? quantidadeResultados : 0})
                </Text>
                <View style={estilos.linha} />
            </View>
        </View>
    );
}

export { criarDescritoresFiltros, DiaryActiveFilters };
