import assert from 'node:assert/strict';
import test from 'node:test';

import {
    codificarCursor,
    decodificarCursor
} from '../../../../src/features/diary/utils/diaryCursor.js';

const filtros = {
    dataInicio: '2026-01-01',
    dataFim: null,
    categorias: ['energia'],
    fases: ['folicular']
};

test('cursor preserva tupla e vínculo com filtros', () => {
    const cursor = codificarCursor({ data: '2026-11-08', id: 42 }, filtros);
    const resultado = decodificarCursor(cursor, filtros);

    assert.equal(resultado.data, '2026-11-08');
    assert.equal(resultado.id, 42);
});

test('rejeita cursor usado com outro conjunto de filtros', () => {
    const cursor = codificarCursor({ data: '2026-11-08', id: 42 }, filtros);

    assert.throws(() => decodificarCursor(cursor, { ...filtros, fases: ['lutea'] }), {
        codigo: 'CURSOR_DIARIO_INVALIDO'
    });
});

for (const cursor of ['', 'não-é-base64', Buffer.from('{}').toString('base64url')]) {
    test('rejeita cursor malformado', () => {
        assert.throws(() => decodificarCursor(cursor, filtros), {
            codigo: 'CURSOR_DIARIO_INVALIDO'
        });
    });
}
