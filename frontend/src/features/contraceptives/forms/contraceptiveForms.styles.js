import { StyleSheet } from 'react-native';
import { typography } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    const interfaceTema = tema.cores.interface;
    return StyleSheet.create({
        formulario: { gap: 20, paddingHorizontal: 24, paddingTop: 0, paddingBottom: 40 },
        campoSeletor: {
            height: 56,
            paddingHorizontal: 14,
            borderWidth: 0.705,
            borderColor: interfaceTema.borda,
            borderRadius: 12,
            backgroundColor: interfaceTema.superficie,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },
        caixaIconeCampo: {
            width: 32,
            height: 32,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center'
        },
        valorSeletor: { ...typography.bodyDefault, color: interfaceTema.textoPrincipal, flex: 1 },
        placeholder: { color: interfaceTema.textoSecundario },
        pressionado: { opacity: 0.7 },
        telaFluxo: { flex: 1, backgroundColor: interfaceTema.fundo },
        conteudoFluxo: { flex: 1, paddingHorizontal: 24, gap: 12 },
        descricaoFluxo: {
            fontFamily: 'DMSans_400Regular',
            fontSize: 14,
            lineHeight: 21,
            color: interfaceTema.textoSecundario,
            marginBottom: 8
        },
        listaHorariosFluxo: { gap: 12 },
        erroHorario: {
            ...typography.caption,
            color: tema.escuro ? '#FF9B88' : tema.cores.feedback.erro,
            marginTop: 8
        },
        acaoFixa: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 24 },
        opcoesIntensidade: { gap: 12 }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
