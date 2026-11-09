const energiaESono = {
    id: 'energia_sono',
    nome: 'Energia e Sono',
    nomeCompacto: 'Energia',
    categorias: [
        {
            id: 'energia',
            nome: 'Energia',
            grupos: [
                {
                    id: 'estado',
                    opcoes: [
                        'Sem energia',
                        'Com energia',
                        'Exausto',
                        'Cansado',
                        'Disposto',
                        'Agitado',
                        'Energia oscilante'
                    ]
                }
            ]
        },
        {
            id: 'qualidade_sono',
            nome: 'Qualidade do sono',
            grupos: [
                {
                    id: 'tipo',
                    opcoes: ['Muito bom', 'Bom', 'Regular', 'Ruim', 'Muito ruim', 'Não reparador']
                },
                {
                    id: 'alteracoes',
                    opcoes: [
                        'Insônia',
                        'Pesadelos',
                        'Sono leve',
                        'Sono agitado',
                        'Sono interrompido',
                        'Sonhos intensos',
                        'Suores noturnos',
                        'Sonolência durante o dia',
                        'Acordar durante a noite',
                        'Dormir mais que o habitual',
                        'Acordar muito cedo'
                    ]
                }
            ]
        },
        { id: 'tempo_sono', nome: 'Tempo de sono', tipoValor: 'duracao_minutos' }
    ]
};

export { energiaESono };
