import assert from 'node:assert/strict';
import test from 'node:test';

import {
    CORES_CONTATO,
    COR_CONTATO_PADRAO,
    ICONES_CONTATO,
    ICONE_CONTATO_PADRAO,
    corContatoEhValida,
    iconeContatoEhValido
} from '../../../../src/features/support-network/constants/contactAppearance.constants.js';

test('define todos os ícones permitidos para contatos', () => {
    assert.deepEqual(ICONES_CONTATO, [
        'pessoa',
        'coracao',
        'sol',
        'escudo',
        'tulipa',
        'aperto_maos',
        'lotus',
        'brilho',
        'arco_iris',
        'sorriso'
    ]);

    assert.equal(ICONE_CONTATO_PADRAO, 'pessoa');
});

test('define todas as cores permitidas para contatos', () => {
    assert.deepEqual(CORES_CONTATO, [
        'branco',
        'coral',
        'verde',
        'laranja',
        'azul',
        'roxo',
        'cinza'
    ]);

    assert.equal(COR_CONTATO_PADRAO, 'branco');
});

test('aceita somente identificadores de ícone conhecidos', () => {
    for (const iconeId of ICONES_CONTATO) {
        assert.equal(iconeContatoEhValido(iconeId), true);
    }

    for (const invalido of ['', 'usuario', 'pessoa ', null, undefined, 1, {}, []]) {
        assert.equal(iconeContatoEhValido(invalido), false);
    }
});

test('aceita somente identificadores de cor conhecidos', () => {
    for (const corId of CORES_CONTATO) {
        assert.equal(corContatoEhValida(corId), true);
    }

    for (const invalido of ['', '#C85A44', 'Coral', 'coral ', null, undefined, 1, {}, []]) {
        assert.equal(corContatoEhValida(invalido), false);
    }
});

test('mantém os catálogos imutáveis', () => {
    assert.equal(Object.isFrozen(ICONES_CONTATO), true);
    assert.equal(Object.isFrozen(CORES_CONTATO), true);
});
