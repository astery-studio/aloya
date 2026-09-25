//Define o visual leve da tela provisória usada para escolher um fluxo de teste.
import {StyleSheet} from 'react-native'

import {tema} from '../../theme'

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    conteudo: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: tema.espacamentosLayout.margemHorizontalTela
    },

    cabecalho: {
        marginBottom: tema.espacamentos.extraGrande
    },

    titulo: {
        ...tema.typography.h1,
        color: tema.cores.neutras.textoPrincipalClaro,
        textAlign: 'center'
    },

    descricao: {
        ...tema.typography.bodyDefault,
        marginTop: tema.espacamentos.pequeno,
        color: tema.cores.neutras.textoSecundarioClaro,
        textAlign: 'center'
    },

    acoes: {
        gap: tema.espacamentos.medio
    }
})

export {estilos}