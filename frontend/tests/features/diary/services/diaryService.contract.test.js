import {
    criarDiaryService,
    validarCatalogo,
    validarRegistro
} from '../../../../src/features/diary/services/diaryService';

describe('contratos do serviço do Diário', () => {
    test('exige uma requisição autenticada', () => {
        expect(() => criarDiaryService()).toThrow(
            'Não foi possível configurar o serviço do Diário.'
        );
    });

    test.each([null, {}, { versao: -1, macrocategorias: [] }, { versao: 0 }])(
        'rejeita catálogo inválido %#',
        (resposta) => {
            expect(() => validarCatalogo(resposta)).toThrow(
                'Não foi possível carregar o Diário. Tente novamente.'
            );
        }
    );

    test('aceita o catálogo versionado', () => {
        const catalogo = { versao: 0, macrocategorias: [] };
        expect(validarCatalogo(catalogo)).toBe(catalogo);
    });

    test.each([
        null,
        {},
        { id: 0, data: '2026-11-09', categorias: [] },
        { id: 1, data: 9, categorias: [] },
        { id: 1, data: '2026-11-09' }
    ])('rejeita registro inválido %#', (resposta) => {
        expect(() => validarRegistro(resposta)).toThrow(
            'Não foi possível salvar o registro. Tente novamente.'
        );
    });

    test('aceita o registro criado', () => {
        const registro = { id: 1, data: '2026-11-09', categorias: [] };
        expect(validarRegistro(registro)).toBe(registro);
    });
});
