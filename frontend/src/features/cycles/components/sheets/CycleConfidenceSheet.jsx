import { useHomeColors } from '../../hooks/useHomeColors';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { ChartLineUpIcon } from '../../../../shared/components/icons/AppIcons';
import { CORES, estilos as estilosClaros } from './CycleConfidenceSheet.styles';

const EXPLICACOES = Object.freeze({
    baixa: 'O histórico disponível ainda é limitado para gerar estimativas mais confiáveis, e as datas previstas podem variar bastante. Continue registrando seus ciclos para melhorar a qualidade das próximas previsões.',
    media: 'Há histórico suficiente para uma estimativa, mas variações recentes podem alterar as datas previstas. Quanto mais ciclos válidos forem registrados, melhor o contexto.',
    alta: 'O histórico apresenta dados suficientes e consistentes para estimativas mais confiáveis. Ainda assim, variações naturais do ciclo podem alterar as datas previstas, que não devem ser consideradas exatas.'
});
const ROTULOS = Object.freeze({ baixa: 'Baixa', media: 'Média', alta: 'Alta' });

function CycleConfidenceSheet({ visivel, nivel, aoFechar }) {
    const { estilos, cor: adaptarCor, escuro } = useHomeColors(estilosClaros);
    const nivelInicial = Object.hasOwn(EXPLICACOES, nivel) ? nivel : 'baixa';
    const [atual, setAtual] = useState(nivelInicial);
    useEffect(() => {
        if (visivel) setAtual(nivelInicial);
    }, [nivelInicial, visivel]);
    const cores = CORES[atual];
    return (
        <BottomSheet
            visivel={visivel}
            onFechar={aoFechar}
            fecharAoTocarFora
            permitirDeslizarParaFechar
            estiloPainel={estilos.painel}
            corPainel={adaptarCor('#FFFFFF', 'backgroundColor')}
        >
            <View style={estilos.conteudo}>
                <View style={estilos.cabecalho}>
                    <View
                        style={[
                            estilos.icone,
                            { backgroundColor: adaptarCor(cores.fundo, 'backgroundColor') }
                        ]}
                    >
                        <ChartLineUpIcon
                            size={28}
                            color={adaptarCor(cores.destaque)}
                            weight="bold"
                        />
                    </View>
                    <Text style={estilos.nivel}>
                        Confiabilidade {ROTULOS[atual].toLocaleLowerCase('pt-BR')}
                    </Text>
                </View>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    O que isso significa?
                </Text>
                <Text style={estilos.descricao}>{EXPLICACOES[atual]}</Text>
                <View
                    accessibilityLabel={`Nível atual: ${ROTULOS[atual].toLocaleLowerCase('pt-BR')}`}
                    style={estilos.escala}
                >
                    {Object.keys(EXPLICACOES).map((item) => {
                        const selecionado = item === atual;
                        return (
                            <Pressable
                                key={item}
                                accessibilityRole="button"
                                accessibilityLabel={ROTULOS[item]}
                                accessibilityState={{ selected: selecionado }}
                                onPress={() => setAtual(item)}
                                style={[
                                    estilos.opcao,
                                    selecionado && { backgroundColor: adaptarCor(cores.destaque) }
                                ]}
                            >
                                <Text
                                    style={[
                                        estilos.textoOpcao,
                                        selecionado && estilos.textoSelecionado,
                                        selecionado && escuro && { color: adaptarCor('#FDF6F3') }
                                    ]}
                                >
                                    {ROTULOS[item]}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </BottomSheet>
    );
}

export { CycleConfidenceSheet, EXPLICACOES, ROTULOS };
