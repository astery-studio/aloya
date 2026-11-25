import {
    criarSugestoesCheckIn,
    LIMITE_POR_CATEGORIA,
    LIMITE_SUGESTOES
} from '../../../../src/features/cycles/utils/checkInSuggestions';

const opcoesPorCategoria = {
    fluxo_menstrual: ['Ausente', 'Muito leve', 'Leve', 'Moderado', 'Intenso', 'Muito intenso'],
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
    ],
    sintomas_emocionais: ['Feliz', 'Animado', 'Tranquilo', 'Motivado', 'Otimista', 'Reflexivo'],
    energia: ['Sem energia', 'Com energia', 'Exausto', 'Cansado', 'Disposto', 'Agitado'],
    digestao: ['Sem alterações', 'Gases', 'Inchaço', 'Azia']
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
    const quantidades = Object.groupBy(sugestoes, ({ categoria }) => categoria.id);
    expect(Object.values(quantidades).every((itens) => itens.length <= LIMITE_POR_CATEGORIA)).toBe(
        true
    );
});

test('usa somente sintomas comuns da fase quando não há histórico suficiente', () => {
    const sugestoes = criarSugestoesCheckIn({ catalogo, fase: 'lutea' });

    expect(sugestoes).toHaveLength(LIMITE_SUGESTOES);
    expect(sugestoes[0].opcao.nome).toBe('Retenção de líquidos');
    expect(new Set(sugestoes.map(({ categoria }) => categoria.id)).size).toBeGreaterThanOrEqual(4);
    expect(sugestoes.some(({ categoria }) => categoria.id === 'fluxo_menstrual')).toBe(false);
});

test('usa um único registro sem expandir toda a categoria menstrual', () => {
    const sugestoes = criarSugestoesCheckIn({
        catalogo,
        fase: 'lutea',
        destaques: [{ categoriaId: 'fluxo_menstrual', valor: 'Leve', ocorrencias: 1 }]
    });

    expect(sugestoes[0].opcao.nome).toBe('Leve');
    expect(sugestoes).toHaveLength(LIMITE_SUGESTOES);
    expect(sugestoes.filter(({ categoria }) => categoria.id === 'fluxo_menstrual')).toHaveLength(1);
});

test('não repete no check-in uma opção já registrada naquele dia', () => {
    const sugestoes = criarSugestoesCheckIn({
        catalogo,
        fase: 'lutea',
        destaques: [{ categoriaId: 'digestao', valor: 'Gases', ocorrencias: 2 }],
        idsExcluidos: ['digestao_1']
    });

    expect(sugestoes).toHaveLength(LIMITE_SUGESTOES);
    expect(sugestoes.map(({ opcao }) => opcao.nome)).not.toContain('Gases');
});

test('mantém oito opções variadas mesmo com preferências do Diário recolhidas', () => {
    const catalogoRecolhido = {
        macrocategorias: catalogo.macrocategorias.map((macro) => ({
            ...macro,
            ativa: false,
            categorias: macro.categorias.map((categoria) => ({
                ...categoria,
                ativaEfetiva: false
            }))
        }))
    };
    const sugestoes = criarSugestoesCheckIn({ catalogo: catalogoRecolhido, fase: 'lutea' });
    expect(sugestoes).toHaveLength(LIMITE_SUGESTOES);
    expect(new Set(sugestoes.map(({ categoria }) => categoria.id)).size).toBeGreaterThanOrEqual(4);
});

test('retorna uma lista vazia quando o catálogo ainda não foi carregado', () => {
    expect(criarSugestoesCheckIn({ fase: 'folicular' })).toEqual([]);
});
