import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
    CaretDownIcon,
    CaretRightIcon,
    CaretUpIcon
} from '../../../../shared/components/icons/AppIcons';
import { estilos } from './CycleCareSection.styles';

function CycleHomeCard({
    categoria,
    titulo,
    descricao,
    icone,
    selo,
    corCategoria,
    aoPressionar,
    rotuloAcessibilidade,
    children
}) {
    const [expandido, setExpandido] = useState(false);
    const alternavel = Boolean(children);
    const IconeAcao = alternavel ? (expandido ? CaretUpIcon : CaretDownIcon) : CaretRightIcon;
    const conteudo = (
        <>
            {icone}
            <View style={estilos.textos}>
                <View style={selo ? estilos.linhaCategoria : undefined}>
                    {categoria ? (
                        <Text style={[estilos.categoria, corCategoria && { color: corCategoria }]}>
                            {categoria}
                        </Text>
                    ) : null}
                    {selo}
                </View>
                <Text style={estilos.titulo}>{titulo}</Text>
                {descricao ? <Text style={estilos.descricao}>{descricao}</Text> : null}
            </View>
            {aoPressionar || alternavel ? <IconeAcao size={20} color="#222222" /> : null}
        </>
    );

    if (!aoPressionar && !alternavel) return <View style={estilos.card}>{conteudo}</View>;

    const botao = (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={rotuloAcessibilidade}
            accessibilityState={alternavel ? { expanded: expandido } : undefined}
            onPress={alternavel ? () => setExpandido((atual) => !atual) : aoPressionar}
            style={alternavel ? estilos.linhaCard : estilos.card}
        >
            {conteudo}
        </Pressable>
    );

    return alternavel ? (
        <View style={[estilos.card, estilos.cardAlternavel]}>
            {botao}
            {expandido ? <View style={estilos.conteudoAlternavel}>{children}</View> : null}
        </View>
    ) : (
        botao
    );
}

export { CycleHomeCard };
