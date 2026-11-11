import {
    ERRO_DATA,
    contarMacrocategoriasPreenchidas,
    listarMacrocategoriasAtivas,
    validarDataRegistro
} from '../../../../src/features/diary/utils/diaryForm';

describe('regras do formulário do Diário', () => {
    test.each([
        [null, '2026-11-09'],
        ['2026-02-30', '2026-11-09'],
        ['2026-11-10', '2026-11-09'],
        ['2026-11-09', 'hoje-inválido']
    ])('rejeita data inválida ou futura %#', (data, hoje) => {
        expect(validarDataRegistro(data, hoje)).toBe(ERRO_DATA);
    });

    test('aceita hoje e uma data passada', () => {
        expect(validarDataRegistro('2026-11-09', '2026-11-09')).toBeNull();
        expect(validarDataRegistro('2026-11-08', '2026-11-09')).toBeNull();
    });

    test('mantém somente macros e categorias efetivamente ativas', () => {
        const categoriaAtiva = { id: 'ativa', ativaEfetiva: true };
        const catalogo = {
            macrocategorias: [
                {
                    id: 'macro-ativa',
                    ativa: true,
                    categorias: [categoriaAtiva, { id: 'inativa', ativaEfetiva: false }]
                },
                {
                    id: 'macro-vazia',
                    ativa: true,
                    categorias: [{ id: 'inativa', ativaEfetiva: false }]
                },
                {
                    id: 'macro-inativa',
                    ativa: false,
                    categorias: [categoriaAtiva]
                }
            ]
        };

        expect(listarMacrocategoriasAtivas(catalogo)).toEqual([
            expect.objectContaining({ id: 'macro-ativa', categorias: [categoriaAtiva] })
        ]);
        expect(listarMacrocategoriasAtivas()).toEqual([]);
    });

    test('conta cada macrocategoria preenchida uma única vez', () => {
        const catalogo = {
            macrocategorias: [
                {
                    ativa: true,
                    categorias: [
                        { id: 'um', tipoValor: 'opcoes', ativaEfetiva: true },
                        { id: 'dois', tipoValor: 'texto', ativaEfetiva: true }
                    ]
                }
            ]
        };
        expect(contarMacrocategoriasPreenchidas(catalogo, { um: ['x'], dois: 'nota' })).toBe(1);
        expect(contarMacrocategoriasPreenchidas(catalogo)).toBe(0);
    });
});
