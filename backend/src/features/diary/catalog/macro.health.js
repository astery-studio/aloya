const saudeEAcompanhamento = {
    id: 'saude_acompanhamento',
    nome: 'Saúde e Acompanhamento',
    categorias: [
        {
            id: 'testes',
            nome: 'Testes',
            grupos: [
                { id: 'teste', opcoes: ['Ovulação', 'Gravidez'] },
                { id: 'resultado', opcoes: ['Positivo', 'Negativo', 'Inválido', 'Inconclusivo'] }
            ]
        },
        {
            id: 'consultas',
            nome: 'Consultas',
            grupos: [
                { id: 'consulta', opcoes: ['Ginecologista', 'Obstetra'] },
                {
                    id: 'exame',
                    opcoes: [
                        'Papanicolau',
                        'Ultrassonografia',
                        'Exame hormonal',
                        'Colposcopia',
                        'Exame de IST',
                        'Mamografia',
                        'Dosagem de LH',
                        'Dosagem de FSH',
                        'Dosagem de progesterona',
                        'Dosagem de estrogênio',
                        'Dosagem de testosterona',
                        'Dosagem de prolactina'
                    ]
                },
                {
                    id: 'acompanhamento',
                    opcoes: ['Rotina', 'Retorno', 'Tratamento', 'Avaliação', 'Encaminhamento']
                }
            ]
        },
        { id: 'anotacao_livre', nome: 'Anotação livre', tipoValor: 'texto', limiteCaracteres: 5000 }
    ]
};

export { saudeEAcompanhamento };
