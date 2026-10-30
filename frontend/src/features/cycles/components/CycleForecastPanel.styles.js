import { StyleSheet } from 'react-native';
import { cores, fontFamilies, radius, shadows } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        conteudo: { paddingTop: 16 },
        heroiFase: { minHeight: 367, alignItems: 'center', paddingHorizontal: 16 },
        heroiFaseFertil: { minHeight: 455 },
        formaProvisoria: {
            width: 260,
            height: 304,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12
        },
        formaInterna: {
            position: 'absolute',
            top: 25,
            width: 234,
            height: 234,
            borderRadius: 117,
            borderWidth: 2,
            borderStyle: 'dashed',
            opacity: 0.4
        },
        orbitaForma: {
            position: 'absolute',
            top: 54,
            width: 94,
            height: 180,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderRadius: radius.circular,
            opacity: 0.4
        },
        orbitaFormaEsquerda: { transform: [{ rotate: '45deg' }] },
        orbitaFormaDireita: { transform: [{ rotate: '-45deg' }] },
        sombraForma: {
            position: 'absolute',
            width: 135,
            height: 23,
            left: 62,
            top: 238,
            borderRadius: radius.circular,
            opacity: 0.1
        },
        formaProvisoriaCompacta: { width: 190, height: 200, paddingVertical: 5 },
        sombraFormaCompacta: { width: 99, height: 17, left: 46, top: 171 },
        tituloFase: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 28,
            fontWeight: '700',
            lineHeight: 35,
            textAlign: 'center'
        },
        diaCiclo: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 24,
            marginTop: 4
        },
        destaqueFertil: {
            width: '100%',
            minHeight: 68,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginTop: 20,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderRadius: radius.grande,
            backgroundColor: tema.escuro
                ? tema.cores.interface.destaqueSuave
                : cores.ciclo.fundoFertil
        },
        iconeDestaqueFertil: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            borderRadius: radius.medio
        },
        tituloDestaqueFertil: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 14,
            fontWeight: '700',
            lineHeight: 21
        },
        textoDestaqueFertil: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 20
        },
        acoes: { gap: 16, paddingHorizontal: 16, paddingTop: 32 },
        botaoAcao: {
            height: 55,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: radius.medio
        },
        secaoPrevisao: { paddingHorizontal: 16, paddingTop: 24 },
        cartaoProximoCiclo: {
            minHeight: 135,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            rowGap: 16,
            columnGap: 12,
            padding: 20,
            borderRadius: tema.radius.cartao,
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            ...shadows.cardSuave
        },
        cartaoProximoCicloComAviso: { minHeight: 198 },
        dataProximoCiclo: { flex: 1, minWidth: 140, gap: 4 },
        rotuloPrevisao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            fontWeight: '700',
            lineHeight: 18,
            letterSpacing: 1.44,
            textTransform: 'uppercase'
        },
        rotuloPrevisaoSecundaria: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            fontWeight: '700',
            lineHeight: 18,
            letterSpacing: 1.2,
            textTransform: 'uppercase'
        },
        valorPrincipal: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 24,
            fontWeight: '700',
            lineHeight: 36,
            textTransform: 'capitalize'
        },
        valorOvulacao: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 27
        },
        avisoConfiabilidade: {
            width: '100%',
            minHeight: 62,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 15,
            paddingHorizontal: 12,
            paddingVertical: 9,
            backgroundColor: tema.escuro ? 'rgba(242, 180, 95, 0.14)' : cores.ciclo.fundoAviso,
            borderWidth: 1,
            borderColor: cores.ciclo.bordaAviso,
            borderRadius: radius.pequeno
        },
        textosAvisoConfiabilidade: { flex: 1 },
        tituloAvisoConfiabilidade: {
            color: cores.feedback.aviso,
            fontFamily: fontFamilies.bold,
            fontSize: 13,
            fontWeight: '700',
            lineHeight: 17
        },
        textoAvisoConfiabilidade: {
            color: tema.escuro ? '#F2B45F' : cores.ciclo.textoAviso,
            fontFamily: fontFamilies.regular,
            fontSize: 11,
            fontWeight: '400',
            lineHeight: 14,
            paddingTop: 1
        },
        textoAvisoBaixa: {
            flex: 1,
            maxWidth: 226,
            color: tema.escuro ? '#F2B45F' : cores.ciclo.textoAviso,
            fontFamily: fontFamilies.regular,
            fontSize: 11,
            fontWeight: '400',
            lineHeight: 14
        },
        previsoesSecundarias: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
        cartaoSecundario: {
            flex: 1,
            minWidth: 130,
            minHeight: 121,
            justifyContent: 'center',
            gap: 8,
            padding: 16,
            borderRadius: radius.cartao,
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            ...shadows.cardSuave
        },
        cabecalhoCartaoSecundario: {
            height: 18,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
        },
        valorSecundario: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 15,
            fontWeight: '700',
            lineHeight: 21
        },
        aviso: {
            width: '100%',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 21,
            marginTop: 16,
            paddingHorizontal: 4
        },
        secaoTexto: { paddingHorizontal: 16, paddingTop: 40 },
        tituloSecao: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 27,
            marginBottom: 16
        },
        textoComMarcador: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            paddingTop: 12
        },
        marcador: {
            width: 8,
            height: 8,
            borderRadius: radius.pequeno,
            backgroundColor: cores.marca.primaria,
            marginTop: 9
        },
        descricaoFase: {
            flex: 1,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 26
        },
        secaoSintomas: { paddingHorizontal: 16, paddingTop: 40 },
        listaSintomas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        sintoma: {
            flexGrow: 1,
            flexBasis: '47%',
            minWidth: 130,
            minHeight: 38,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: radius.circular,
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda
        },
        marcadorSintoma: {
            width: 6,
            height: 6,
            borderRadius: radius.pequeno,
            backgroundColor: cores.marca.primaria
        },
        textoSintoma: {
            flexShrink: 1,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.medium,
            fontSize: 12,
            fontWeight: '500',
            lineHeight: 21
        },
        secaoDicas: { gap: 12, paddingHorizontal: 16, paddingTop: 40 },
        dica: {
            minHeight: 67,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            borderRadius: radius.grande,
            backgroundColor: tema.escuro
                ? tema.cores.interface.superficieElevada
                : cores.ciclo.superficieSuave,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda
        },
        numeroDica: {
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.medio,
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda
        },
        textoNumeroDica: {
            color: cores.marca.primaria,
            fontFamily: fontFamilies.bold,
            fontSize: 14,
            fontWeight: '700',
            lineHeight: 21
        },
        textoDica: {
            flex: 1,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 21
        },
        estadoSemCiclo: { gap: 24, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
        cartaoIntroducao: {
            minHeight: 666,
            alignItems: 'center',
            gap: 16,
            paddingHorizontal: 24,
            paddingVertical: 32,
            borderRadius: radius.cartao,
            borderWidth: 1,
            borderColor: cores.ciclo.bordaIntroducao
        },
        acoesSemCiclo: { alignSelf: 'stretch', gap: 16, paddingTop: 16 },
        chamadaRecursos: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            fontWeight: '700',
            lineHeight: 18,
            letterSpacing: 1.68
        },
        recursos: { gap: 12 },
        recurso: {
            minHeight: 92,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            padding: 16,
            borderRadius: radius.grande,
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            ...shadows.cardSuave
        },
        iconeRecurso: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.medio,
            backgroundColor: tema.escuro
                ? tema.cores.interface.superficieElevada
                : cores.ciclo.superficieSuave,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda
        },
        textoRecurso: { flex: 1 },
        tituloRecurso: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 14,
            fontWeight: '700',
            lineHeight: 21
        },
        descricaoRecurso: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 18
        }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
