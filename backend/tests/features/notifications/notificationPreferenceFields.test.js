import assert from 'node:assert/strict';
import test from 'node:test';
import { validarAlteracao } from '../../../src/features/notifications/notificationPreferenceFields.js';

test('valida campos, tipos e limites das preferências de notificação', () => {
    for (const [chave, valor] of [
        ['antecedenciaProximoCiclo', 0], ['antecedenciaProximoCiclo', 5],
        ['horarioLembreteDiario', '00:00'], ['horarioLembreteDiario', '23:59'],
        ['redeApoio.convites.recebido', true], ['ciclo.fases', false]
    ]) assert.deepEqual(validarAlteracao({ chave, valor }), { chave, valor });

    for (const [chave, valor] of [
        ['antecedenciaProximoCiclo', 6], ['antecedenciaProximoCiclo', -1],
        ['horarioLembreteDiario', '24:00'], ['horarioLembreteDiario', '7:00'],
        ['redeApoio.convites.recebido', 'true'], ['redeApoioAtiva', false], ['__proto__', true]
    ]) assert.throws(() => validarAlteracao({ chave, valor }), { status: 422 });
    assert.throws(() => validarAlteracao({ chave: 'ciclo.fases', valor: true, usuarioId: 2 }), { status: 422 });
});
