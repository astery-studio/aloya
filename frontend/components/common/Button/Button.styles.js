/**
 * Define estilos, tamanhos e variantes visuais compartilhados pelos botões da aplicação.
 */
import { StyleSheet } from 'react-native';
import {
    cores,
    fontFamilies,
    radius,
    typography
} from '../../../theme';

const estilos = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderRadius: radius.buttonAndInput
    },

    conteudo: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center'
    },

    texto: {
        textAlign: 'center'
    },

    pressionado: {
        opacity: 0.65,
        transform: [
            {
                scale: 0.98
            }
        ]
    },

    desativado: {
        backgroundColor:
            cores.neutras.bordaClara,
        borderColor:
            cores.neutras.bordaClara,
        borderStyle: 'solid'
    }
});

const tamanhos = {
    compacto: {
        container: {
            height: 52
        },
        texto: {
            ...typography.bodyDefault,
            fontFamily:
                fontFamilies.medium,
            fontWeight: '500'
        }
    },

    grande: {
        container: {
            height: 56
        },
        texto: {
            ...typography.bodyLarge,
            letterSpacing: 0.18
        }
    }
};

const variantes = {
    laranja: {
        container: {
            backgroundColor:
                cores.marca.primaria
        },
        texto: {
            color:
                cores.neutras.superficieClara
        }
    },

    verde: {
        container: {
            backgroundColor:
                cores.marca.secundaria
        },
        texto: {
            color:
                cores.neutras.superficieClara
        }
    },

    branco: {
        container: {
            backgroundColor:
                cores.neutras.superficieClara,
            borderColor:
                cores.neutras.bordaClara,
            borderWidth: 1.41
        },
        texto: {
            color:
                cores.neutras
                    .textoSecundarioClaro
        }
    },

    preto: {
        container: {
            backgroundColor:
                cores.neutras
                    .textoPrincipalClaro
        },
        texto: {
            color:
                cores.neutras.superficieClara
        }
    },

    vermelho: {
        container: {
            backgroundColor:
                cores.feedback.erro
        },
        texto: {
            color:
                cores.neutras.superficieClara
        }
    },

    bordaLaranja: {
        container: {
            borderColor:
                cores.marca.primaria,
            borderWidth: 1.41
        },
        texto: {
            color:
                cores.marca.primaria,
            fontFamily:
                fontFamilies.semibold,
            fontWeight: '600'
        }
    },

    bordaVerde: {
        container: {
            borderColor:
                cores.marca.secundaria,
            borderWidth: 1.41
        },
        texto: {
            color:
                cores.marca.secundaria
        }
    },

    tracejado: {
        container: {
            borderColor:
                cores.neutras.bordaTracejada,
            borderStyle: 'dashed',
            borderWidth: 1.41
        },
        texto: {
            color:
                cores.neutras
                    .textoSecundarioClaro,
            fontSize: 15,
            lineHeight: 22.5
        }
    }
};

export {
    estilos,
    tamanhos,
    variantes
};
