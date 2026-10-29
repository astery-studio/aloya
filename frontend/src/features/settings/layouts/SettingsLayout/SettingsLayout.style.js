// Define a estrutura visual compartilhada pelas telas internas de configurações.
import {
    StyleSheet
} from 'react-native'

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor:
                tema.cores.interface
                    .fundo
        },

        areaInterativa: {
            flex: 1,
            backgroundColor:
                tema.cores.interface
                    .fundo
        },

        conteudo: {
            flexGrow: 1,
            paddingHorizontal:
                tema.espacamentosLayout
                    .margemHorizontalTela,
            paddingBottom:
                tema.espacamentos.grande,
            backgroundColor:
                tema.cores.interface
                    .fundo
        },

        rodape: {
            width: '100%',
            alignItems: 'center',
            marginTop: 128.2,
            paddingBottom:
                tema.espacamentos.grande
        },

        rodapeFixo: {
            width: '100%',
            alignItems: 'center',
            paddingHorizontal:
                tema.espacamentosLayout
                    .margemHorizontalTela,
            paddingTop:
                tema.espacamentos.medio,
            paddingBottom:
                tema.espacamentos.grande,
            backgroundColor:
                tema.cores.interface
                    .fundo,
            borderTopWidth: 0.7,
            borderTopColor:
                tema.cores.interface
                    .separador
        }
    })
}

export {
    criarEstilos
}