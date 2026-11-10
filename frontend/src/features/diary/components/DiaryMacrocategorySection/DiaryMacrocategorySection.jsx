import { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDown, CaretUp } from 'phosphor-react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './DiaryMacrocategorySection.styles';

function montarEstiloCabecalho(estilos, expandido, cores, pressionado) {
    return [
        estilos.cabecalho,
        expandido && { backgroundColor: cores.fundoExpandido },
        pressionado && estilos.pressionado
    ];
}

function DiaryMacrocategorySection({
    titulo,
    icone: Icone,
    paleta = 'ciclo',
    expandido,
    aoAlternar,
    acessorioCabecalho,
    desabilitado = false,
    children
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const cores = tema.cores.redeApoio[paleta] ?? tema.cores.redeApoio.ciclo;
    const IconeExpansao = expandido ? CaretUp : CaretDown;

    return (
        <View
            style={[
                estilos.container,
                expandido && { borderColor: cores.bordaExpandida },
                desabilitado && estilos.desabilitado
            ]}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={titulo}
                accessibilityState={{ expanded: expandido, disabled: desabilitado }}
                disabled={desabilitado}
                onPress={aoAlternar}
                style={({ pressed }) =>
                    montarEstiloCabecalho(estilos, expandido, cores, pressed)
                }
            >
                <View style={[estilos.caixaIcone, { backgroundColor: cores.fundoIcone }]}>
                    <Icone size={18} color={cores.icone} />
                </View>
                <Text style={[estilos.titulo, expandido && { color: cores.icone }]}>{titulo}</Text>
                {acessorioCabecalho}
                <IconeExpansao
                    size={18}
                    color={expandido ? cores.icone : tema.cores.interface.textoSecundario}
                />
            </Pressable>
            {expandido ? (
                <View style={[estilos.conteudo, { borderTopColor: cores.bordaExpandida }]}>
                    {children}
                </View>
            ) : null}
        </View>
    );
}

export default memo(DiaryMacrocategorySection);
export { montarEstiloCabecalho };
