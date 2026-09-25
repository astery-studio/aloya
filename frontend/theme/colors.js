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
    })
})

export { cores }