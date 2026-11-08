import { StyleSheet } from 'react-native';
import { typography } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    const interfaceTema = tema.cores.interface;
    return StyleSheet.create({
        formulario: { gap: 20, paddingHorizontal: 24, paddingTop: 0, paddingBottom: 40 },
        campoCadastro: tema.escuro
            ? {
                  borderRadius: 12,
                  borderWidth: 0.705,
                  borderColor: '#2C2C2C',
                  backgroundColor: '#1E1E1E'
              }
            : {},
        painelEdicao: tema.escuro
            ? {
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  boxShadow: '0 -4px 32px 0 rgba(34, 34, 34, 0.10)'
              }
            : {},
        caixaCampoEdicao: tema.escuro
            ? {
                  borderRadius: 12,
                  borderWidth: 1.41,
                  borderColor: '#A5D6A7',
                  backgroundColor: '#2C2C2C'
              }
            : {},
        textoCampoEdicao: tema.escuro ? { color: '#999999' } : {},
        botaoSalvarDesativado: tema.escuro ? { borderRadius: 12, backgroundColor: '#2C2C2C' } : {},
        textoSalvarDesativado: tema.escuro ? { color: '#757575' } : {},
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
        telaFluxo: { flex: 1, backgroundColor: tema.escuro ? '#121212' : interfaceTema.fundo },
        conteudoFluxo: { flex: 1, paddingHorizontal: 24, gap: 12 },
        descricaoFluxo: {
            fontFamily: 'DMSans_400Regular',
            fontSize: 14,
            lineHeight: 21,
            color: interfaceTema.textoSecundario,
            marginBottom: 8
        },
        adicionarHorario: tema.escuro
            ? {
                  borderRadius: 12,
                  borderWidth: 1.41,
                  borderStyle: 'dashed',
                  borderColor: 'rgba(255, 255, 255, 0.24)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)'
              }
            : {},
        textoAdicionarHorario: tema.escuro ? { color: '#999999' } : {},
        listaHorariosFluxo: { gap: 12 },
        erroHorario: {
            ...typography.caption,
            color: tema.escuro ? '#EF9A9A' : tema.cores.feedback.erro,
            marginTop: 8
        },
        acaoFixa: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 24 },
        opcoesIntensidade: { gap: 12 }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
