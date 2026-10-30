//Representa uma decisão selecionável de remover ou manter o acesso de um contato.
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CheckIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos } from './CategoryDecisionOption.styles';

function CategoryDecisionOption({
    titulo,
    descricao,
    selecionado = false,
    variante = 'manter',
    tipoIndicador = 'radio',
    destacarFundo = false,
    aoPressionar,
    desabilitado = false,
    rotuloAcessibilidade
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const perigo = variante === 'remover';

    const indicadorCheck = tipoIndicador === 'check';

    const bloqueado = desabilitado || typeof aoPressionar !== 'function';

    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityLabel={rotuloAcessibilidade || titulo}
            accessibilityState={{
                checked: selecionado,
                disabled: bloqueado
            }}
            disabled={bloqueado}
            onPress={aoPressionar}
            style={({ pressed }) => [
                estilos.opcao,
                selecionado &&
                    (perigo ? estilos.opcaoSelecionadaPerigo : estilos.opcaoSelecionadaManter),
                selecionado &&
                    destacarFundo &&
                    (perigo ? estilos.fundoPerigo : estilos.fundoManter),
                pressed && !bloqueado && estilos.pressionada,
                bloqueado && estilos.desabilitada
            ]}
        >
            <View style={estilos.textos}>
                <Text
                    numberOfLines={3}
                    style={[
                        estilos.titulo,
                        selecionado && (perigo ? estilos.tituloPerigo : estilos.tituloManter)
                    ]}
                >
                    {titulo}
                </Text>

                {descricao ? (
                    <Text numberOfLines={3} style={estilos.descricao}>
                        {descricao}
                    </Text>
                ) : null}
            </View>

            <View
                testID={perigo ? 'indicador-remover' : 'indicador-manter'}
                style={[
                    estilos.indicador,
                    selecionado && (perigo ? estilos.indicadorPerigo : estilos.indicadorManter)
                ]}
            >
                {selecionado ? (
                    indicadorCheck ? (
                        <CheckIcon
                            size={14}
                            weight="bold"
                            color={tema.cores.interface.textoSobreDestaque}
                        />
                    ) : (
                        <View style={estilos.centroIndicador} />
                    )
                ) : null}
            </View>
        </Pressable>
    );
}

export { CategoryDecisionOption };
