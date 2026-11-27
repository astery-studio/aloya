import assert from 'node:assert/strict';
import test from 'node:test';
import { permiteNotificacao } from '../../../src/features/notifications/notificationEvents.service.js';

test('aplica categoria, grupo e evento sem apagar escolhas individuais', () => {
    const evento = 'redeApoio.ciclo.registro';
    const grupo = 'redeApoio.ciclo';
    assert.equal(permiteNotificacao(null, evento), true);
    assert.equal(permiteNotificacao(null, 'ciclo.menstrual.confirmacao'), false);
    assert.equal(permiteNotificacao({ redeApoioAtiva: false }, evento), false);
    assert.equal(
        permiteNotificacao({ ajustesPorEvento: { [grupo]: false, [evento]: true } }, evento),
        false
    );
    assert.equal(
        permiteNotificacao({ ajustesPorEvento: { [grupo]: true, [evento]: false } }, evento),
        false
    );
    assert.equal(
        permiteNotificacao({ ajustesPorEvento: { [grupo]: true, [evento]: true } }, evento),
        true
    );
    assert.equal(permiteNotificacao(null, 'redeApoio.ciclo.desconhecido'), false);
});
