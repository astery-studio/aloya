//Centraliza as permissões exibidas no formulário e seus identificadores aceitos pela API.
function congelarOpcoes(opcoes) {
    return Object.freeze(opcoes.map(opcao => Object.freeze(opcao)))
}

const permissoesGerais = congelarOpcoes([
    {
        id: 'geral.fase_atual',
        titulo: 'Acesso à Fase Atual'
    },
    {
        id: 'geral.anticoncepcionais',
        titulo: 'Acesso aos Anticoncepcionais'
    },
    {
        id: 'geral.historico_ciclo',
        titulo: 'Acesso ao Histórico de Ciclo'
    },
    {
        id: 'geral.alerta_anticoncepcional',
        titulo: 'Receber alerta de Anticoncepcional'
    },
    {
        id: 'geral.dicas',
        titulo: 'Receber dicas'
    }
])

const gruposPermissoes = Object.freeze([
    Object.freeze({
        id: 'ciclo',
        titulo: 'Ciclo e Sangramento',
        icone: 'gota',
        paleta: 'ciclo',
        permissoes: congelarOpcoes([
            {
                id: 'ciclo.fluxo_menstrual',
                titulo: 'Fluxo menstrual'
            },
            {
                id: 'ciclo.sangramento_escape',
                titulo: 'Sangramento de escape'
            },
            {
                id: 'ciclo.secrecao_corrimento',
                titulo: 'Secreção/corrimento'
            }
        ])
    }),

    Object.freeze({
        id: 'corpo',
        titulo: 'Corpo e Sintomas Físicos',
        icone: 'pessoa',
        paleta: 'corpo',
        permissoes: congelarOpcoes([
            {
                id: 'corpo.sintomas_fisicos',
                titulo: 'Sintomas físicos'
            },
            {
                id: 'corpo.pele',
                titulo: 'Pele'
            },
            {
                id: 'corpo.cabelo',
                titulo: 'Cabelo'
            },
            {
                id: 'corpo.digestao',
                titulo: 'Digestão'
            },
            {
                id: 'corpo.banheiro',
                titulo: 'Banheiro'
            },
            {
                id: 'corpo.regiao_genital',
                titulo: 'Região genital'
            },
            {
                id: 'corpo.torax_peito',
                titulo: 'Tórax/Peito'
            },
            {
                id: 'corpo.temperatura_basal',
                titulo: 'Temperatura basal'
            },
            {
                id: 'corpo.peso',
                titulo: 'Peso'
            }
        ])
    }),

    Object.freeze({
        id: 'emocional',
        titulo: 'Emocional',
        icone: 'coracao',
        paleta: 'emocional',
        permissoes: congelarOpcoes([
            {
                id: 'emocional.sintomas_emocionais',
                titulo: 'Sintomas emocionais'
            },
            {
                id: 'emocional.sintomas_pre_menstruais',
                titulo: 'Sintomas pré-menstruais'
            }
        ])
    }),

    Object.freeze({
        id: 'energia',
        titulo: 'Energia e Sono',
        icone: 'raio',
        paleta: 'energia',
        permissoes: congelarOpcoes([
            {
                id: 'energia.energia',
                titulo: 'Energia'
            },
            {
                id: 'energia.qualidade_sono',
                titulo: 'Qualidade do sono'
            },
            {
                id: 'energia.tempo_sono',
                titulo: 'Tempo de sono'
            }
        ])
    }),

    Object.freeze({
        id: 'vidaIntima',
        titulo: 'Vida Íntima e Social',
        icone: 'pessoas',
        paleta: 'vidaIntima',
        permissoes: congelarOpcoes([
            {
                id: 'vida_intima.atividade_sexual',
                titulo: 'Atividade sexual (com parceiro/a)'
            },
            {
                id: 'vida_intima.autoerotismo',
                titulo: 'Autoerotismo'
            },
            {
                id: 'vida_intima.desejo_libido',
                titulo: 'Desejo/Libido'
            },
            {
                id: 'vida_intima.vida_social',
                titulo: 'Vida social'
            }
        ])
    }),

    Object.freeze({
        id: 'saude',
        titulo: 'Saúde e Acompanhamento',
        icone: 'primeirosSocorros',
        paleta: 'saude',
        permissoes: congelarOpcoes([
            {
                id: 'saude.testes',
                titulo: 'Testes'
            },
            {
                id: 'saude.consultas',
                titulo: 'Consultas'
            },
            {
                id: 'saude.anotacao_livre',
                titulo: 'Anotação livre'
            }
        ])
    })
])

export {gruposPermissoes, permissoesGerais}