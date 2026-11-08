import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema, editavel = false) {
    return StyleSheet.create({
        carregando: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        },
        mes: {
            width: 312,
            paddingHorizontal: 0
        },
        tituloMes: {
            height: 22,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4
        },
        nomeMes: {
            color: tema.escuro
                ? editavel
                    ? '#E3E3E3'
                    : '#F4F1EA'
                : tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 15,
            lineHeight: 22
        },
        anoMes: {
            color: tema.escuro
                ? editavel
                    ? '#999999'
                    : '#AAA6AA'
                : tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18
        },
        grade: {
            marginTop: 14,
            flexDirection: 'row',
            flexWrap: 'wrap'
        },
        diaDaSemana: {
            width: '14.2857%',
            height: editavel ? 13 : 20,
            color: tema.escuro ? (editavel ? '#999999' : '#AAA6AA') : '#A09D96',
            fontFamily: fontFamilies.bold,
            fontSize: 9,
            lineHeight: 14,
            letterSpacing: 0.27,
            textAlign: 'center'
        },
        celula: {
            width: '14.2857%',
            height: 42,
            alignItems: 'center',
            justifyContent: 'center'
        },
        numeroDia: {
            color: tema.escuro
                ? editavel
                    ? '#E3E3E3'
                    : '#F4F1EA'
                : tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 20,
            textAlign: 'center'
        },
        diaMarcado: {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.escuro ? '#D07162' : '#C85A44'
        },
        diaEditavel: {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center'
        },
        diaSelecionadoEdicao: {
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: tema.escuro ? '#EF9A9A' : '#C85A44'
        },
        numeroSelecionadoEdicao: {
            color: tema.escuro ? '#EF9A9A' : '#C85A44',
            fontFamily: fontFamilies.bold
        },
        numeroMarcado: {
            color: '#FFFFFF',
            fontFamily: fontFamilies.bold,
            fontSize: 13,
            lineHeight: 20,
            textAlign: 'center'
        }
    });
}

export { criarEstilos };
