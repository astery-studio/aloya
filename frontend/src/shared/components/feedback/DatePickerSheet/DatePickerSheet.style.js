//Define a aparência do calendário e das listas de mês e ano
import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../theme';

function criarEstilos(tema, aparenciaCadastro = false) {
    const personalizar = tema.escuro && aparenciaCadastro;
    return StyleSheet.create({
        painelCadastro: personalizar
            ? {
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  boxShadow: '0 -4px 32px 0 rgba(34, 34, 34, 0.10)'
              }
            : {},
        tituloSheetCadastro: personalizar ? { color: '#E3E3E3' } : {},
        opcaoListaSelecionada: personalizar ? { borderRadius: 10, backgroundColor: '#A5D6A7' } : {},
        calendario: {
            width: '100%',
            alignSelf: 'center',
            paddingTop: tema.espacamentos.grande,
            paddingBottom: tema.espacamentos.medio
        },

        navegacao: {
            minHeight: 48,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tema.espacamentos.grande
        },

        botaoNavegacao: {
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center'
        },

        tituloData: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        },

        botaoTitulo: {
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
            gap: 3
        },

        tituloMes: {
            color: personalizar ? '#FFFFFFDE' : tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            lineHeight: 27,
            includeFontPadding: false
        },

        linhaSemana: {
            width: '100%',
            flexDirection: 'row',
            marginBottom: tema.espacamentos.pequeno
        },

        casaSemana: {
            flex: 1,
            minHeight: 36,
            alignItems: 'center',
            justifyContent: 'center'
        },

        textoSemana: {
            color: personalizar ? '#FFFFFFDE' : tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            lineHeight: 20,
            includeFontPadding: false
        },

        grade: {
            width: '100%'
        },

        linhaCalendario: {
            width: '100%',
            flexDirection: 'row'
        },

        casaDia: {
            flex: 1,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center'
        },

        botaoDia: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center'
        },

        botaoDiaSelecionado: {
            backgroundColor: personalizar ? '#A5D6A7' : tema.cores.marca.primaria
        },

        textoDia: {
            color: personalizar ? '#FFFFFFDE' : tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            lineHeight: 24,
            includeFontPadding: false
        },

        textoDiaSelecionado: {
            color: personalizar ? '#121212DE' : tema.cores.neutras.superficieClara,
            fontFamily: fontFamilies.bold
        },

        textoDiaDesabilitado: {
            color: tema.cores.interface.textoDesabilitado
        },

        listaOpcoes: {
            height: 288,
            flexGrow: 0
        },

        opcaoLista: {
            height: 48,
            alignItems: 'center',
            justifyContent: 'center'
        },

        textoOpcao: {
            color: personalizar ? '#FFFFFFDE' : tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            lineHeight: 24,
            includeFontPadding: false
        },

        textoOpcaoSelecionada: {
            color: personalizar ? '#121212' : tema.cores.marca.primaria,
            fontFamily: fontFamilies.bold
        },

        textoOpcaoDesabilitada: {
            color: tema.cores.interface.textoDesabilitado
        },

        mensagem: {
            marginTop: tema.espacamentos.pequeno,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            textAlign: 'center'
        },

        mensagemErro: {
            marginTop: tema.espacamentos.pequeno,
            color: tema.escuro ? '#EF9A9A' : tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            textAlign: 'center'
        }
    });
}

export { criarEstilos };
