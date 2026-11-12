import { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDown } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretUp } from 'phosphor-react-native/src/icons/CaretUp';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './DiaryMacrocategorySection.styles';

const COR_ICONE_RECOLHIDO = '#A8A49C';

function montarEstiloCabecalho(estilos, expandido, cores, pressionado) {
    return [
        estilos.cabecalho,
        expandido && { backgroundColor: cores.fundoDiarioExpandido },
        pressionado && estilos.pressionado
    ];
}

function DiaryMacrocategorySection({
    titulo,
    icone: Icone,
    iconeProps,
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
                style={({ pressed }) => montarEstiloCabecalho(estilos, expandido, cores, pressed)}
            >
                <View style={[estilos.caixaIcone, { backgroundColor: cores.fundoIcone }]}>
                    <Icone size={18} color={cores.icone} {...iconeProps} />
                </View>
                <Text style={[estilos.titulo, expandido && { color: cores.icone }]}>{titulo}</Text>
                {acessorioCabecalho}
                <IconeExpansao size={18} color={expandido ? cores.icone : COR_ICONE_RECOLHIDO} />
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
export { COR_ICONE_RECOLHIDO, montarEstiloCabecalho };
