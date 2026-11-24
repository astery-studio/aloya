import {
    criarSugestoesCheckIn,
    LIMITE_SUGESTOES
} from '../../../../src/features/cycles/utils/checkInSuggestions';

const opcoesPorCategoria = {
    sintomas_fisicos: [
        'Fadiga',
        'Retenção de líquidos',
        'Inchaço',
        'Sensibilidade',
        'Dor de cabeça'
    ],
    sintomas_pre_menstruais: [
        'Irritabilidade',
        'Oscilações de humor',
        'Diminuição da motivação',
        'Choro fácil'
    ]
};

const catalogo = {
    macrocategorias: [
        {
            ativa: true,
            categorias: Object.entries(opcoesPorCategoria).map(([id, nomes]) => ({
                id,
                ativaEfetiva: true,
                opcoes: nomes.map((nome, indice) => ({ id: `${id}_${indice}`, nome }))
            }))
        }
    ]
};

test('prioriza padrões pessoais da fase e completa oito sugestões típicas', () => {
    const sugestoes = criarSugestoesCheckIn({
        catalogo,
        fase: 'lutea',
        destaques: [
            { categoriaId: 'sintomas_fisicos', valor: 'Fadiga', ocorrencias: 4 },
            { categoriaId: 'pele', valor: 'Acne', ocorrencias: 3 }
        ]
    });

    expect(sugestoes).toHaveLength(LIMITE_SUGESTOES);
    expect(sugestoes[0].opcao.nome).toBe('Fadiga');
    expect(sugestoes.map(({ opcao }) => opcao.nome)).not.toContain('Acne');
    expect(new Set(sugestoes.map(({ opcao }) => opcao.id)).size).toBe(LIMITE_SUGESTOES);
});

test('usa somente sintomas comuns da fase quando não há histórico suficiente', () => {
    const sugestoes = criarSugestoesCheckIn({ catalogo, fase: 'lutea' });

    expect(sugestoes).toHaveLength(LIMITE_SUGESTOES);
    expect(sugestoes[0].opcao.nome).toBe('Retenção de líquidos');
    expect(sugestoes.at(-1).opcao.nome).toBe('Choro fácil');
});

test('mantém entre seis e oito opções mesmo sem as categorias principais', () => {
    const nomes = [
        'Sem energia',
        'Com energia',
        'Exausto',
        'Cansado',
        'Disposto',
        'Agitado',
        'Energia oscilante'
    ];
    const catalogoAlternativo = {
        macrocategorias: [
            {
                ativa: true,
                categorias: [
                    {
                        id: 'energia',
                        ativaEfetiva: true,
                        opcoes: nomes.map((nome, indice) => ({ id: `energia_${indice}`, nome }))
                    }
                ]
            }
        ]
    };

    const sugestoes = criarSugestoesCheckIn({ catalogo: catalogoAlternativo, fase: 'lutea' });
    expect(sugestoes).toHaveLength(7);
});
