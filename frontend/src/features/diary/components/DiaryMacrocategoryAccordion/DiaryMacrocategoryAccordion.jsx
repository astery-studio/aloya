import { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDownIcon, CaretUpIcon } from '../../../../shared/components/icons/AppIcons';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './DiaryMacrocategoryAccordion.styles';

function DiaryMacrocategoryAccordion({
    titulo,
    icone: Icone,
    iconeProps,
    paleta = 'ciclo',
    expandido,
    aoAlternar,
    acessorio,
    rotuloAcao,
    desabilitado = false,
    variante = 'sheet',
    testID,
    children
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const cores = tema.cores.redeApoio[paleta] ?? tema.cores.redeApoio.ciclo;
    const IconeExpansao = expandido ? CaretUpIcon : CaretDownIcon;
    const formulario = variante === 'formulario';

    return (
        <View
            testID={testID}
            style={[
                estilos.container,
                formulario && estilos.containerFormulario,
                expandido && estilos.expandido,
                expandido && { borderColor: cores.bordaExpandida },
                desabilitado && estilos.desabilitado
            ]}
        >
            <View
                style={[
                    estilos.cabecalho,
                    formulario && estilos.cabecalhoFormulario,
                    expandido && { backgroundColor: cores.fundoDiarioExpandido }
                ]}
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                        rotuloAcao ?? `${expandido ? 'Recolher' : 'Expandir'} ${titulo}`
                    }
                    accessibilityState={{ expanded: expandido, disabled: desabilitado }}
                    disabled={desabilitado}
                    onPress={aoAlternar}
                    style={({ pressed }) => [
                        estilos.expansao,
                        pressed && !desabilitado && estilos.pressionado
                    ]}
                >
                    <View style={[estilos.caixaIcone, { backgroundColor: cores.fundoIcone }]}>
                        <Icone size={18} color={cores.icone} {...iconeProps} />
                    </View>
                    <Text
                        style={[estilos.titulo, expandido && { color: cores.icone }]}
                        numberOfLines={2}
                    >
                        {titulo}
                    </Text>
                    <IconeExpansao size={18} color={expandido ? cores.icone : '#A8A49C'} />
                </Pressable>
                {acessorio}
            </View>
            {expandido ? (
                <View
                    style={
                        formulario
                            ? [estilos.conteudoFormulario, { borderTopColor: cores.bordaExpandida }]
                            : null
                    }
                >
                    {children}
                </View>
            ) : null}
        </View>
    );
}

export default memo(DiaryMacrocategoryAccordion);
export { DiaryMacrocategoryAccordion };
