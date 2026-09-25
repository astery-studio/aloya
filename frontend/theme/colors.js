//Centraliza todas as cores utilizadas na aplicação.
const cores = Object.freeze({
    marca: Object.freeze({
        primaria: '#C85A44',
        secundaria: '#2C4C3B'
    }),

    neutras: Object.freeze({
        fundoClaro: '#F7F5F0',
        superficieClara: '#FFFFFF',
        textoPrincipalClaro: '#222222',
        textoSecundarioClaro: '#5C5C59',
        bordaClara: '#E6E2D8',
        bordaTracejada: '#C8C4BA',
        switchInativo: '#D8D4CC',
        fundoEscuro: '#181C1A',
        superficieEscura: '#232926',
        textoPrincipalEscuro: '#EAE8E3'
    }),

    feedback: Object.freeze({
        sucesso: '#3B8255',
        aviso: '#D68C3A',
        erro: '#B43D3D',
        informacao: '#4A758E'
    }),

    icones: Object.freeze({
        configuracoes: Object.freeze({
            verde: Object.freeze({
                caixa: '#E8F0EC',
                icone: '#2C4C3B'
            }),

            azul: Object.freeze({
                caixa: '#EEF0F8',
                icone: '#4A5899'
            }),

            laranja: Object.freeze({
                caixa: '#F5EDE3',
                icone: '#C85A44'
            })
        }),

        anticoncepcionais: Object.freeze({
            vermelho: Object.freeze({
                caixa: '#FDF0EC',
                icone: '#C85A44'
            }),

            verde: Object.freeze({
                caixa: '#EEF4F0',
                icone: '#2C4C3B'
            })
        })
    }),

    redeApoio: Object.freeze({
        ciclo: Object.freeze({
            fundoIcone: '#FDF0EC',
            icone: '#C85A44',
            fundoExpandido: 'rgba(253, 240, 236, 0.267)',
            bordaExpandida: 'rgba(200, 90, 68, 0.333)'
        }),

        corpo: Object.freeze({
            fundoIcone: '#EEF4F0',
            icone: '#2C4C3B',
            fundoExpandido: 'rgba(238, 244, 240, 0.267)',
            bordaExpandida: 'rgba(44, 76, 59, 0.333)'
        }),

        emocional: Object.freeze({
            fundoIcone: '#EDE6F8',
            icone: '#7B5EA7',
            fundoExpandido: 'rgba(237, 230, 248, 0.267)',
            bordaExpandida: 'rgba(123, 94, 167, 0.333)'
        }),

        energia: Object.freeze({
            fundoIcone: '#FBF3E0',
            icone: '#B07D2A',
            fundoExpandido: 'rgba(251, 243, 224, 0.267)',
            bordaExpandida: 'rgba(176, 125, 42, 0.333)'
        }),

        vidaIntima: Object.freeze({
            fundoIcone: '#FAECF2',
            icone: '#B04A70',
            fundoExpandido: 'rgba(250, 236, 242, 0.267)',
            bordaExpandida: 'rgba(176, 74, 112, 0.333)'
        }),

        saude: Object.freeze({
            fundoIcone: '#EEF0F8',
            icone: '#4A5899',
            fundoExpandido: 'rgba(238, 240, 248, 0.267)',
            bordaExpandida: 'rgba(74, 88, 153, 0.333)'
        })
    })
})

export {cores}