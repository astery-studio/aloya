import { ERRO_CONTEUDO, prepararFormularioDiario } from '../../../../src/features/diary/utils/diaryForm';

const catalogo = {
    macrocategorias: [
        {
            id: 'corpo',
            ativa: true,
            categorias: [
                {
                    id: 'temperatura_basal',
                    tipoValor: 'decimal_escalado',
                    ativaEfetiva: true
                },
                { id: 'sintomas', tipoValor: 'opcoes', ativaEfetiva: true }
            ]
        }
    ]
};

describe('payload do formulário do Diário', () => {
    test('exige ao menos uma categoria preenchida', () => {
        const resultado = prepararFormularioDiario({
            catalogo,
            data: '2026-11-09',
            hoje: '2026-11-09'
        });

        expect(resultado.valido).toBe(false);
        expect(resultado.erros.conteudo).toBe(ERRO_CONTEUDO);
        expect(resultado.dados.categorias).toEqual([]);
    });

    test('mantém o erro da categoria preenchida', () => {
        const resultado = prepararFormularioDiario({
            catalogo,
            valores: { temperatura_basal: '43,0' },
            data: '2026-11-09',
            hoje: '2026-11-09'
        });

        expect(resultado.valido).toBe(false);
        expect(resultado.erros.temperatura_basal).toContain('32,0 e 42,0');
        expect(resultado.dados.categorias).toEqual([
            { categoriaId: 'temperatura_basal', valor: '43.0', perturbada: false }
        ]);
    });

    test('monta somente as categorias preenchidas', () => {
        const resultado = prepararFormularioDiario({
            catalogo,
            valores: { temperatura_basal: '36,5', sintomas: ['colica'] },
            data: '2026-11-08',
            hoje: '2026-11-09'
        });

        expect(resultado.valido).toBe(true);
        expect(resultado.erros).toEqual({});
        expect(resultado.dados).toEqual({
            data: '2026-11-08',
            fusoHorario: expect.any(String),
            categorias: [
                { categoriaId: 'temperatura_basal', valor: '36.5', perturbada: false },
                { categoriaId: 'sintomas', opcoes: ['colica'] }
            ]
        });
    });

    test('inclui o erro da data no resultado completo', () => {
        const resultado = prepararFormularioDiario({
            catalogo,
            valores: { sintomas: ['colica'] },
            data: '2026-11-10',
            hoje: '2026-11-09'
        });
        expect(resultado.valido).toBe(false);
        expect(resultado.erros.data).toBe('A data do registro não pode ser no futuro.');
    });
});
