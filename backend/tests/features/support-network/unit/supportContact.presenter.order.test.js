import assert from 'node:assert/strict';
import test from 'node:test';

import {
    compararContatos,
    ordenarContatos
} from '../../../../src/features/support-network/presenters/supportContact.presenter.js';

test('ordena pendentes antes dos ativos e alfabetiza em português dentro dos grupos', () => {
    const entrada = [
        { id: 4, status: 'ativo', identificacao: 'Zélia' },
        { id: 3, status: 'pendente', identificacao: 'Tiago' },
        { id: 2, status: 'ativo', identificacao: 'Ágata' },
        { id: 1, status: 'pendente', identificacao: 'Rafael' }
    ];

    assert.deepEqual(
        ordenarContatos(entrada).map(({ id }) => id),
        [1, 3, 2, 4]
    );
    assert.deepEqual(
        entrada.map(({ id }) => id),
        [4, 3, 2, 1]
    );
});

test('usa o identificador como desempate estável para nomes equivalentes', () => {
    assert.ok(
        compararContatos(
            { id: 8, status: 'ativo', identificacao: 'Ana' },
            { id: 9, status: 'ativo', identificacao: 'ana' }
        ) < 0
    );
});
