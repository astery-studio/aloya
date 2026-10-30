/**
 * Define estilos, tamanhos e variantes visuais compartilhados.
 */
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../theme';

const COR_LARANJA_ACESSIVEL = '#B94D38';

const COR_LARANJA_BORDA = '#A94734';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            borderRadius: tema.radius.buttonAndInput
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
            backgroundColor: tema.cores.interface.separador,
            borderColor: tema.cores.interface.borda,
            borderStyle: 'solid'
        }
    });
}

function criarTamanhos(tema) {
    return {
        compacto: {
            container: {
                height: 52
            },

            texto: {
                ...tema.typography.bodyDefault,
                fontFamily: fontFamilies.medium,
                fontWeight: '500'
            }
        },

        grande: {
            container: {
                height: 56
            },

            texto: {
                ...tema.typography.bodyLarge,
                letterSpacing: 0.18
            }
        }
    };
}

function criarVariantes(tema) {
    return {
        laranja: {
            container: {
                backgroundColor: COR_LARANJA_ACESSIVEL
            },

            texto: {
                color: '#FFFFFF'
            }
        },

        verde: {
            container: {
                backgroundColor: tema.cores.interface.destaque
            },

            texto: {
                color: tema.cores.interface.textoSobreDestaque
            }
        },

        branco: {
            container: {
                backgroundColor: tema.cores.interface.superficie,
                borderColor: tema.cores.interface.borda,
                borderWidth: 1.41
            },

            texto: {
                color: tema.cores.interface.textoSecundario
            }
        },

        preto: {
            container: {
                backgroundColor: tema.escuro ? tema.cores.interface.textoPrincipal : '#222222'
            },

            texto: {
                color: tema.escuro ? '#222222' : '#FFFFFF'
            }
        },

        vermelho: {
            container: {
                backgroundColor: tema.cores.feedback.erro
            },

            texto: {
                color: '#FFFFFF'
            }
        },

        bordaLaranja: {
            container: {
                borderColor: tema.escuro ? '#E58E7B' : COR_LARANJA_BORDA,
                borderWidth: 1.41
            },

            texto: {
                color: tema.escuro ? '#EFA18F' : COR_LARANJA_BORDA,
                fontFamily: fontFamilies.semibold,
                fontWeight: '600'
            }
        },

        bordaVerde: {
            container: {
                borderColor: tema.cores.interface.destaque,
                borderWidth: 1.41
            },

            texto: {
                color: tema.cores.interface.destaque
            }
        },

        texto: {
            container: {
                backgroundColor: 'transparent'
            },

            texto: {
                color: tema.cores.interface.textoSecundario,
                fontFamily: fontFamilies.medium,
                fontWeight: '500'
            }
        },

        tracejado: {
            container: {
                borderColor: tema.cores.interface.textoDesabilitado,
                borderStyle: 'dashed',
                borderWidth: 1.41
            },

            texto: {
                color: tema.cores.interface.textoSecundario,
                fontSize: 15,
                lineHeight: 22.5
            }
        }
    };
}

export { COR_LARANJA_ACESSIVEL, criarEstilos, criarTamanhos, criarVariantes };
