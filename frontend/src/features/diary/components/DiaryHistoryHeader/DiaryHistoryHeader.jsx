import { ActivityIndicator, Text, View } from 'react-native';

import { DiaryActiveFilters } from '../DiaryActiveFilters/DiaryActiveFilters';
import { DiaryOverviewCard } from '../DiaryOverviewCard/DiaryOverviewCard';

function DiaryTimelineDivider({ estilos }) {
    return (
        <View
            accessible
            accessibilityRole="header"
            accessibilityLabel="Linha do tempo"
            style={estilos.divisor}
        >
            <View style={estilos.linhaDivisor} />
            <Text style={estilos.textoDivisor}>LINHA DO TEMPO</Text>
            <View style={estilos.linhaDivisor} />
        </View>
    );
}

function DiaryHistoryHeader({
    atualizando,
    resumo,
    filtrosAtivos,
    filtros,
    rotulosCategorias,
    quantidadeResultados,
    aoRemoverFiltro,
    aoLimparFiltros,
    mostrarConteudo = true,
    mostrarDivisor = true,
    estilos,
    tema
}) {
    return (
        <View style={estilos.cabecalhoLista}>
            <View style={estilos.introducao}>
                <Text style={estilos.descricao}>
                    Conheça melhor seu corpo! Registre sintomas, emoções e descobertas ao longo do
                    seu ciclo.
                </Text>
                {atualizando ? (
                    <View accessibilityLiveRegion="polite" style={estilos.atualizando}>
                        <ActivityIndicator size="small" color={tema.cores.interface.destaque} />
                        <Text style={estilos.textoAtualizando}>Atualizando Diário...</Text>
                    </View>
                ) : null}
            </View>
            {mostrarConteudo && filtrosAtivos ? (
                <DiaryActiveFilters
                    filtros={filtros}
                    rotulosCategorias={rotulosCategorias}
                    quantidadeResultados={quantidadeResultados}
                    aoRemover={aoRemoverFiltro}
                    aoLimpar={aoLimparFiltros}
                />
            ) : mostrarConteudo && resumo ? (
                <DiaryOverviewCard {...resumo} />
            ) : null}
            {mostrarConteudo && mostrarDivisor && !filtrosAtivos ? (
                <DiaryTimelineDivider estilos={estilos} />
            ) : null}
        </View>
    );
}

export { DiaryHistoryHeader, DiaryTimelineDivider };
