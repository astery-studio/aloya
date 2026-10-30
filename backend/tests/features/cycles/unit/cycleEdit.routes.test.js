import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleEditRoutes } from '../../../../src/features/cycles/routes/cycleEdit.routes.js';

function criarDependencias() {
    const chamadas = [];
    const router = {
        use(...args) { chamadas.push(['use', ...args]); },
        get(...args) { chamadas.push(['get', ...args]); },
        patch(...args) { chamadas.push(['patch', ...args]); }
    };
    const autenticar = () => {};
    const buscar = () => {};
    const editar = () => {};
    return {
        chamadas,
        dependencias: {
            Router: () => router,
            authMiddleware: { autenticar },
            controller: { buscar, editar }
        },
        esperadas: [
            ['use', autenticar],
            ['get', '/:id', buscar],
            ['patch', '/:id', editar]
        ]
    };
}

test('rejeita dependências incompletas', () => {
    const { dependencias } = criarDependencias();
    assert.throws(() => criarCycleEditRoutes(), /Router/);
    assert.throws(() => criarCycleEditRoutes({ Router: dependencias.Router }), /autenticação/);
    assert.throws(() => criarCycleEditRoutes({ ...dependencias, controller: null }), /controller/);
    assert.throws(() => criarCycleEditRoutes({ ...dependencias, controller: { buscar() {} } }), /controller/);
});

test('registra autenticação, consulta e edição', () => {
    const { dependencias, chamadas, esperadas } = criarDependencias();
    const router = criarCycleEditRoutes(dependencias);
    assert.ok(router);
    assert.deepEqual(chamadas, esperadas);
});
