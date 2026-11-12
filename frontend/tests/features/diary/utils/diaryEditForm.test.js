import {
    criarAssinaturaFormulario,
    criarValoresIniciaisEdicao
} from '../../../../src/features/diary/utils/diaryEditForm';

const catalogo = {
    macrocategorias: [
        {
            id: 'macro',
            ativa: true,
            categorias: [
                { id: 'sintomas', tipoValor: 'opcoes', ativaEfetiva: true },
                {
                    id: 'anotacao_livre',
                    tipoValor: 'texto',
                    limiteCaracteres: 500,
                    ativaEfetiva: true
                },
                { id: 'tempo_sono', tipoValor: 'duracao_minutos', ativaEfetiva: true },
                { id: 'peso', tipoValor: 'decimal', ativaEfetiva: true }
            ]
        }
    ]
};

test('converte todas as formas de valor do detalhe para o formulário', () => {
    expect(
        criarValoresIniciaisEdicao({
            categorias: [
                { id: 'sintomas', opcoes: [{ id: 'colica' }, { id: 'fadiga' }] },
                { id: 'anotacao_livre', texto: 'Hoje me senti bem.' },
                { id: 'tempo_sono', duracaoMinutos: 480 },
                { id: 'peso', valor: '62.5' },
                null
            ]
        })
    ).toEqual({
        sintomas: ['colica', 'fadiga'],
        anotacao_livre: 'Hoje me senti bem.',
        tempo_sono: 480,
        peso: '62.5'
    });
});

test('a assinatura ignora a ordem das opções, mas detecta alterações reais', () => {
    const base = {
        catalogo,
        data: '2026-11-11',
        hoje: '2026-11-12'
    };
    const original = criarAssinaturaFormulario({
        ...base,
        valores: { sintomas: ['colica', 'fadiga'], peso: '62.5' }
    });
    expect(
        criarAssinaturaFormulario({
            ...base,
            valores: { sintomas: ['fadiga', 'colica'], peso: '62,5' }
        })
    ).toBe(original);
    expect(
        criarAssinaturaFormulario({
            ...base,
            data: '2026-11-10',
            valores: { sintomas: ['fadiga', 'colica'], peso: '62,5' }
        })
    ).not.toBe(original);
});
