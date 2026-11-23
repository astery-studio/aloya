import { Text, View } from 'react-native';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { ChartLineUpIcon } from '../../../../shared/components/icons/AppIcons';
import { CORES, estilos } from './CycleConfidenceSheet.styles';

const EXPLICACOES = Object.freeze({
    baixa: 'O histórico disponível ainda é limitado para gerar estimativas mais confiáveis, e as datas previstas podem variar bastante. Continue registrando seus ciclos para melhorar a qualidade das próximas previsões.',
    media: 'Há histórico suficiente para uma estimativa, mas variações recentes podem alterar as datas previstas. Quanto mais ciclos válidos forem registrados, melhor o contexto.',
    alta: 'O histórico apresenta dados suficientes e consistentes para estimativas mais confiáveis. Ainda assim, variações naturais do ciclo podem alterar as datas previstas, que não devem ser consideradas exatas.'
});

function CycleConfidenceSheet({ visivel, nivel, aoFechar }) {
    const atual = Object.hasOwn(EXPLICACOES, nivel) ? nivel : 'baixa';
    const cores = CORES[atual];
    return (
        <BottomSheet
            visivel={visivel}
            onFechar={aoFechar}
            permitirDeslizarParaFechar
            estiloPainel={estilos.painel}
            corPainel="#FFFFFF"
        >
            <View style={estilos.conteudo}>
                <View style={estilos.cabecalho}>
                    <View style={[estilos.icone, { backgroundColor: cores.fundo }]}>
                        <ChartLineUpIcon size={28} color={cores.destaque} weight="bold" />
                    </View>
                    <Text style={estilos.nivel}>Confiabilidade {atual}</Text>
                </View>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    O que isso significa?
                </Text>
                <Text style={estilos.descricao}>{EXPLICACOES[atual]}</Text>
                <View accessibilityLabel={`Nível atual: ${atual}`} style={estilos.escala}>
                    {Object.keys(EXPLICACOES).map((item) => {
                        const selecionado = item === atual;
                        return (
                            <View
                                key={item}
                                accessibilityState={{ selected: selecionado }}
                                style={[
                                    estilos.opcao,
                                    selecionado && { backgroundColor: cores.destaque }
                                ]}
                            >
                                <Text
                                    style={[
                                        estilos.textoOpcao,
                                        selecionado && estilos.textoSelecionado
                                    ]}
                                >
                                    {item[0].toUpperCase() + item.slice(1)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </BottomSheet>
    );
}

export { CycleConfidenceSheet, EXPLICACOES };
