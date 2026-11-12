import { obterRegistrosAdjacentes } from '../../../../src/features/diary/utils/diaryRecordNavigation';

const registros = [
    { id: 3, data: '2026-11-12' },
    { id: 2, data: '2026-11-11' },
    { id: 1, data: '2026-11-10' }
];

test('navega para datas anterior e próxima em uma lista decrescente', () => {
    expect(obterRegistrosAdjacentes(registros, 2)).toEqual({
        anterior: registros[2],
        proximo: registros[0]
    });
});

test('desabilita somente a direção sem registro disponível', () => {
    expect(obterRegistrosAdjacentes(registros, 3)).toEqual({
        anterior: registros[1],
        proximo: null
    });
    expect(obterRegistrosAdjacentes(registros, 1)).toEqual({
        anterior: null,
        proximo: registros[1]
    });
});

test('trata seleção ausente ou coleção inválida com segurança', () => {
    expect(obterRegistrosAdjacentes(registros, 99)).toEqual({ anterior: null, proximo: null });
    expect(obterRegistrosAdjacentes(null, 2)).toEqual({ anterior: null, proximo: null });
});
