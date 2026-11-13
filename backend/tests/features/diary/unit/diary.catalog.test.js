import assert from 'node:assert/strict';
import test from 'node:test';

import { CATALOGO_DIARIO } from '../../../../src/features/diary/catalog/diary.catalog.js';

test('catálogo preserva as seis macrocategorias na ordem do protótipo', () => {
    assert.deepEqual(
        CATALOGO_DIARIO.map(({ nome }) => nome),
        [
            'Ciclo e Sangramento',
            'Corpo e Sintomas Físicos',
            'Emocional',
            'Energia e Sono',
            'Vida Íntima e Social',
            'Saúde e Acompanhamento'
        ]
    );
    assert.deepEqual(
        CATALOGO_DIARIO.map(({ ordem }) => ordem),
        [1, 2, 3, 4, 5, 6]
    );
});

test('catálogo possui identificadores e ordens únicas', () => {
    const categorias = CATALOGO_DIARIO.flatMap(({ categorias }) => categorias);
    const opcoes = categorias.flatMap(({ opcoes }) => opcoes);

    assert.equal(categorias.length, 24);
    assert.equal(new Set(categorias.map(({ id }) => id)).size, categorias.length);
    assert.equal(new Set(opcoes.map(({ id }) => id)).size, opcoes.length);

    for (const macro of CATALOGO_DIARIO) {
        assert.deepEqual(
            macro.categorias.map(({ ordem }) => ordem),
            macro.categorias.map((_, indice) => indice + 1)
        );
    }
});

test('dados íntimos são marcados sem classificar vida social como sexual', () => {
    const macro = CATALOGO_DIARIO.find(({ id }) => id === 'vida_intima_social');
    const vidaSocial = macro.categorias.find(({ id }) => id === 'vida_social');

    assert.equal(macro.sensivel, true);
    assert.equal(vidaSocial.sensivel, false);
    assert.equal(macro.categorias.filter(({ sensivel }) => sensivel).length, 3);
});
