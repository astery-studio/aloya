const vidaIntimaESocial = {
    id: 'vida_intima_social',
    nome: 'Vida Íntima e Social',
    sensivel: true,
    categorias: [
        {
            id: 'atividade_sexual',
            nome: 'Atividade sexual (com parceiro/a)',
            sensivel: true,
            grupos: [
                {
                    id: 'tipo',
                    opcoes: [
                        'Brinquedos eróticos',
                        'Outras práticas',
                        'Penetração vaginal',
                        'Penetração anal',
                        'Sexo oral',
                        'Sem penetração',
                        'Penetração com dedos',
                        'Estimulação genital',
                        'Fricção entre corpos',
                        'Estimulação manual'
                    ]
                },
                {
                    id: 'contracepcao',
                    opcoes: [
                        'Coito interrompido',
                        'Preservativo interno',
                        'Preservativo externo',
                        'Sem método',
                        'Lubrificante'
                    ]
                },
                {
                    id: 'experiencia',
                    opcoes: [
                        'Neutra',
                        'Sem prazer',
                        'Prazerosa',
                        'Muito prazerosa',
                        'Desconfortável',
                        'Dolorosa',
                        'Interrompida'
                    ]
                }
            ]
        },
        {
            id: 'autoerotismo',
            nome: 'Autoerotismo',
            sensivel: true,
            grupos: [
                {
                    id: 'praticas',
                    opcoes: [
                        'Vibradores',
                        'Brinquedos eróticos',
                        'Acessórios íntimos',
                        'Fantasias',
                        'Masturbação',
                        'Exploração'
                    ]
                }
            ]
        },
        {
            id: 'desejo_libido',
            nome: 'Desejo/Libido',
            sensivel: true,
            grupos: [
                {
                    id: 'desejo',
                    opcoes: [
                        'Sem desejo',
                        'Libido baixa',
                        'Libido habitual',
                        'Libido elevada',
                        'Desejo espontâneo',
                        'Desejo variável',
                        'Pensamentos sexuais frequentes',
                        'Fantasias'
                    ]
                },
                {
                    id: 'resposta_sexual',
                    opcoes: [
                        'Excitação',
                        'Orgasmo',
                        'Orgasmos múltiplos',
                        'Sem orgasmo',
                        'Satisfação sexual',
                        'Insatisfação sexual',
                        'Sensibilidade genital aumentada',
                        'Sensibilidade genital reduzida',
                        'Lubrificação aumentada'
                    ]
                }
            ]
        },
        {
            id: 'vida_social',
            nome: 'Vida social',
            grupos: [
                {
                    id: 'interacao',
                    opcoes: ['Sociável', 'Buscando companhia', 'Reservado', 'Evitando interações']
                },
                {
                    id: 'experiencia',
                    opcoes: [
                        'Agradáveis',
                        'Boa conexão',
                        'Compreensão',
                        'Acolhimento',
                        'Conflitos',
                        'Desentendimentos',
                        'Exclusão',
                        'Pertencimento',
                        'Dificuldade de comunicação',
                        'Sobrecarga social'
                    ]
                },
                {
                    id: 'relacionamentos',
                    opcoes: [
                        'Aproximação',
                        'Distanciamento',
                        'Saudade',
                        'Conexão',
                        'Conversa significativa'
                    ]
                }
            ]
        }
    ]
};

export { vidaIntimaESocial };
