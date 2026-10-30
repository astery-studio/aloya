import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleParametersRoutes } from '../../../../src/features/settings/routes/cycleParameters.routes.js';

test('registra consulta e atualização autenticadas', () => {
    const chamadas = [];
    const router = {
        use: (...args) => chamadas.push(['use', ...args]),
        get: (...args) => chamadas.push(['get', ...args]),
        patch: (...args) => chamadas.push(['patch', ...args])
    };
    const autenticar = () => {};
    const buscar = () => {};
    const atualizar = () => {};
    const rateLimit = () => {};
    assert.equal(criarCycleParametersRoutes({
        Router: () => router,
        authMiddleware: { autenticar },
        controller: { buscar, atualizar },
        rateLimit
    }), router);
    assert.deepEqual(chamadas, [
        ['use', autenticar],
        ['get', '/cycle-parameters', buscar],
        ['patch', '/cycle-parameters', rateLimit, atualizar]
    ]);
});
