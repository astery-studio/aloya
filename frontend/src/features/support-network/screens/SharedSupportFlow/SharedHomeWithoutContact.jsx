import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HeartIcon } from '../../../../shared/components/icons/AppIcons';
import { fontFamilies } from '../../../../shared/theme';
import { CycleEducationSection } from '../../../cycles/components/CycleEducationSection';
import { useHomeColors } from '../../../cycles/hooks/useHomeColors';

function SharedHomeNotice() {
    const { estilos } = useHomeColors(estilosClaros);

    return (
        <View style={estilos.areaAviso}>
            <View style={estilos.aviso}>
                <View style={estilos.icone}>
                    <HeartIcon color="#D68C3A" size={24} />
                </View>
                <View style={estilos.textos}>
                    <Text style={estilos.titulo}>Cada corpo tem seu próprio ritmo.</Text>
                    <Text style={estilos.descricao}>
                        O ciclo menstrual pode variar, assim como os sintomas e as necessidades de
                        cada pessoa. As fases não determinam o humor, a personalidade ou o
                        comportamento de alguém. O melhor apoio começa com diálogo e respeito.
                    </Text>
                </View>
            </View>
        </View>
    );
}

function SharedHomeWithoutContact() {
    return (
        <ScrollView
            contentContainerStyle={estilosClaros.conteudo}
            showsVerticalScrollIndicator={false}
        >
            <CycleEducationSection perspectiva="contato" rodape={<SharedHomeNotice />} />
        </ScrollView>
    );
}

const estilosClaros = StyleSheet.create({
    conteudo: { paddingTop: 28, paddingBottom: 24 },
    areaAviso: {
        width: '100%',
        minHeight: 160.333,
        paddingTop: 34,
        alignItems: 'flex-start'
    },
    aviso: {
        alignSelf: 'stretch',
        minHeight: 126.333,
        padding: 19,
        borderRadius: 25,
        borderWidth: 0.667,
        borderColor: '#ECDCC8',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13
    },
    icone: {
        width: 44,
        height: 44,
        borderRadius: 15,
        flexShrink: 0,
        backgroundColor: 'rgba(214, 140, 58, 0.10)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    textos: { flex: 1, minWidth: 0 },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        letterSpacing: -0.32,
        includeFontPadding: false
    },
    descricao: {
        maxWidth: 261.667,
        // Compensa a folga antes da primeira linha sem apertar as demais.
        marginTop: -2,
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 9,
        lineHeight: 13.95,
        includeFontPadding: false
    }
});

export { SharedHomeNotice, SharedHomeWithoutContact };
