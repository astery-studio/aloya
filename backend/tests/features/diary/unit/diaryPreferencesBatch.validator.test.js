import assert from 'node:assert/strict';
import test from 'node:test';

import { validarLotePreferencias } from '../../../../src/features/diary/validators/diaryPreferencesBatch.validator.js';

test('aceita alteração atômica de macros e categorias', () => {
    assert.deepEqual(
        validarLotePreferencias({
            versao: 4,
            macrocategorias: [{ id: 'energia_sono', ativa: false }],
            categorias: [{ id: 'qualidade_sono', ativa: false }]
        }),
        {
            versao: 4,
            macrocategorias: [{ id: 'energia_sono', ativa: false }],
            categorias: [{ id: 'qualidade_sono', ativa: false }]
        }
    );
});

test('rejeita lote vazio, duplicado ou com identidade do cliente', () => {
    assert.throws(() => validarLotePreferencias({ versao: 0 }), {
        codigo: 'PREFERENCIAS_INVALIDAS'
    });
    assert.throws(
        () =>
            validarLotePreferencias({
                versao: 0,
                categorias: [
                    { id: 'energia', ativa: true },
                    { id: 'energia', ativa: false }
                ]
            }),
        { codigo: 'PREFERENCIAS_INVALIDAS' }
    );
    assert.throws(
        () =>
            validarLotePreferencias({
                versao: 0,
                usuarioId: 1,
                categorias: [{ id: 'energia', ativa: true }]
            }),
        { codigo: 'PREFERENCIAS_INVALIDAS' }
    );
});
