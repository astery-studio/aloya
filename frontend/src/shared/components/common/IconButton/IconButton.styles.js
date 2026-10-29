import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    const estilos = StyleSheet.create({
        container: {
            width: 44,
            minWidth: 44,
            height: 44,
            minHeight: 44,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: tema.radius.buttonAndInput
        },

        pressionado: {
            opacity: 0.65,
            transform: [
                {
                    scale: 0.96
                }
            ]
        }
    });

    const variantes = Object.freeze({
        neutro: Object.freeze({
            container: Object.freeze({
                backgroundColor: 'transparent',
                borderWidth: 0
            }),
            icone: tema.cores.interface.textoSecundario
        }),

        perigo: Object.freeze({
            container: Object.freeze({
                backgroundColor: 'transparent',
                borderWidth: 0
            }),
            icone: tema.cores.feedback.erro
        }),

        selecionado: Object.freeze({
            container: Object.freeze({
                backgroundColor: tema.cores.interface.superficie,
                borderWidth: 1,
                borderColor: tema.cores.interface.borda
            }),
            icone: tema.cores.interface.textoSecundario
        }),

        calendario: Object.freeze({
            container: Object.freeze({
                backgroundColor: tema.cores.interface.superficie,
                borderWidth: 1,
                borderColor: tema.cores.interface.borda,
                borderRadius: tema.radius.onboardingCalendar
            }),
            icone: tema.cores.interface.textoSecundario,
            tamanhoIcone: 22
        }),

        desativado: Object.freeze({
            container: Object.freeze({
                backgroundColor: 'transparent',
                borderWidth: 0,
                opacity: 0.4
            }),
            icone: tema.cores.interface.textoDesabilitado
        })
    });

    return { estilos, variantes };
}

export { criarEstilos };
