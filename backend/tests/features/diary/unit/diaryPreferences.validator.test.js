import assert from 'node:assert/strict';
import test from 'node:test';

import { validarAtualizacaoPreferencia } from '../../../../src/features/diary/validators/diaryPreferences.validator.js';

test('aceita somente versão e estado válidos', () => {
    assert.deepEqual(validarAtualizacaoPreferencia({ versao: 0, ativa: false }), {
        versao: 0,
        ativa: false
    });
});

test('rejeita campos desconhecidos inclusive usuarioId', () => {
    assert.throws(() => validarAtualizacaoPreferencia({ versao: 0, ativa: true, usuarioId: 9 }), {
        codigo: 'CAMPO_DESCONHECIDO'
    });
});

for (const versao of [-1, 1.5, '1', null]) {
    test(`rejeita versão inválida: ${String(versao)}`, () => {
        assert.throws(() => validarAtualizacaoPreferencia({ versao, ativa: true }), {
            codigo: 'VERSAO_PREFERENCIAS_INVALIDA'
        });
    });
}

for (const ativa of [1, 'true', null, undefined]) {
    test(`rejeita estado inválido: ${String(ativa)}`, () => {
        assert.throws(() => validarAtualizacaoPreferencia({ versao: 0, ativa }), {
            codigo: 'ESTADO_PREFERENCIA_INVALIDO'
        });
    });
}
