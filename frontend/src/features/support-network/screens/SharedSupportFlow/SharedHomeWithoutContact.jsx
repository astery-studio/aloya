import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HeartIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { espacamentosLayout, fontFamilies } from '../../../../shared/theme';
import { CycleEducationSection } from '../../../cycles/components/CycleEducationSection';

function SharedHomeNotice() {
    const { cores } = useTheme();
    const { superficie, borda, textoPrincipal, textoSecundario } = cores.interface;

    return (
        <View style={[estilos.aviso, { backgroundColor: superficie, borderColor: borda }]}>
            <View style={estilos.icone}>
                <HeartIcon color="#B87622" size={22} />
            </View>
            <View style={estilos.textos}>
                <Text style={[estilos.titulo, { color: textoPrincipal }]}>
                    Cada corpo tem seu próprio ritmo.
                </Text>
                <Text style={[estilos.descricao, { color: textoSecundario }]}>
                    O ciclo menstrual pode variar, assim como os sintomas e as necessidades de cada
                    pessoa. As fases não determinam o humor, a personalidade ou o comportamento de
                    alguém. O melhor apoio começa com diálogo e respeito.
                </Text>
            </View>
        </View>
    );
}

function SharedHomeWithoutContact() {
    return (
        <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
            <CycleEducationSection
                perspectiva="contato"
                estiloSecao={estilos.educacao}
                rodape={<SharedHomeNotice />}
            />
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    conteudo: { paddingTop: 28, paddingBottom: 24 },
    educacao: { paddingHorizontal: espacamentosLayout.margemHorizontalTela },
    aviso: {
        marginTop: 32,
        padding: 18,
        borderRadius: 24,
        borderWidth: 0.7,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    icone: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: '#F8F1E5',
        alignItems: 'center',
        justifyContent: 'center'
    },
    textos: { flex: 1, gap: 6 },
    titulo: { fontFamily: fontFamilies.medium, fontSize: 16, lineHeight: 22 },
    descricao: { fontFamily: fontFamilies.regular, fontSize: 10, lineHeight: 14 }
});

export { SharedHomeNotice, SharedHomeWithoutContact };
