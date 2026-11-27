import assert from 'node:assert/strict';
import test from 'node:test';

import { CATEGORIAS_POR_ID } from '../../../../src/features/diary/catalog/diaryCatalog.lookup.js';
import { validarCategoriaPreenchida } from '../../../../src/features/diary/validators/diaryCategory.validator.js';
import { validarCriacaoRegistro } from '../../../../src/features/diary/validators/diaryEntry.validator.js';

test('rejeita opção pertencente a outra categoria', () => {
    const opcaoEmocional = CATEGORIAS_POR_ID.get('sintomas_emocionais').opcoes[0];

    assert.throws(
        () =>
            validarCategoriaPreenchida({
                categoriaId: 'sintomas_fisicos',
                opcoes: [opcaoEmocional.id]
            }),
        { codigo: 'OPCOES_DIARIO_INVALIDAS' }
    );
});

test('rejeita precisão decimal maior que a do protótipo', () => {
    assert.throws(
        () => validarCategoriaPreenchida({ categoriaId: 'temperatura_basal', valor: '36.78' }),
        { codigo: 'VALOR_DECIMAL_INVALIDO' }
    );
});

for (const data of ['2026-02-30', '08/11/2026', '', null]) {
    test(`rejeita data inválida: ${String(data)}`, () => {
        assert.throws(
            () =>
                validarCriacaoRegistro({
                    data,
                    fusoHorario: 'UTC',
                    categorias: [{ categoriaId: 'anotacao_livre', texto: 'a' }]
                }),
            { codigo: 'DATA_REGISTRO_INVALIDA' }
        );
    });
}

test('rejeita fuso inexistente', () => {
    assert.throws(
        () =>
            validarCriacaoRegistro({
                data: '2026-11-08',
                fusoHorario: 'Planeta/Marte',
                categorias: [{ categoriaId: 'anotacao_livre', texto: 'a' }]
            }),
        { codigo: 'FUSO_HORARIO_INVALIDO' }
    );
});
