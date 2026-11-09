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
        }
    ]
};

export { vidaIntimaESocial };
