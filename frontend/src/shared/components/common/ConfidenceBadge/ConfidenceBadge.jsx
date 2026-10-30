//Mostra a confiabilidade dos dados do ciclo nas variantes simples ou composta.
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../../../hooks/useTheme';
import { ChartLineUpIcon } from '../../icons/AppIcons';
import { ConfidenceStatusBar } from './ConfidenceStatusBar';
import { criarEstilos } from './ConfidenceBadge.styles';

const configuracoesNivel = Object.freeze({
    alta: Object.freeze({
        rotulo: 'Alta'
    }),
    media: Object.freeze({
        rotulo: 'Média'
    }),
    baixa: Object.freeze({
        rotulo: 'Baixa'
    })
});

const variantesPermitidas = Object.freeze(['simples', 'composta']);

function ConfidenceBadge({ nivel, variante = 'simples' }) {
    const tema = useTheme();
    const { estilos, variantes } = useMemo(() => criarEstilos(tema), [tema]);
    const configuracao = configuracoesNivel[nivel];

    if (!configuracao) {
        throw new Error(`Nível de confiança inválido: ${nivel}`);
    }

    if (!variantesPermitidas.includes(variante)) {
        throw new Error(`Variante de confiança inválida: ${variante}`);
    }

    const { rotulo } = configuracao;
    const visual = variantes[nivel];
    const ehComposta = variante === 'composta';

    return (
        <View
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${ehComposta ? 'Confiabilidade' : 'Confiança'} ${rotulo.toLowerCase()}`}
            style={[
                estilos.container,
                ehComposta ? estilos.composta : estilos.simples,
                {
                    backgroundColor: visual.fundo,
                    borderColor: visual.borda
                }
            ]}
        >
            {ehComposta ? (
                <>
                    <View style={estilos.linha}>
                        <ChartLineUpIcon size={16} color={visual.cor} weight="bold" />

                        <Text
                            numberOfLines={1}
                            style={[
                                estilos.rotulo,
                                {
                                    color: visual.cor
                                }
                            ]}
                        >
                            CONFIABILIDADE
                        </Text>
                    </View>

                    <View style={estilos.linha}>
                        <ConfidenceStatusBar nivel={nivel} cor={visual.cor} />

                        <Text
                            numberOfLines={1}
                            style={[
                                estilos.nivel,
                                {
                                    color: visual.cor
                                }
                            ]}
                        >
                            {rotulo}
                        </Text>
                    </View>
                </>
            ) : (
                <>
                    <View
                        style={[
                            estilos.ponto,
                            {
                                backgroundColor: visual.cor
                            }
                        ]}
                    />

                    <Text
                        numberOfLines={1}
                        style={[
                            estilos.textoSimples,
                            {
                                color: visual.cor
                            }
                        ]}
                    >
                        Confiança {rotulo}
                    </Text>
                </>
            )}
        </View>
    );
}

export { ConfidenceBadge };
