//Testa o caminho do histórico e garante que a autenticação seja executada primeiro.
import test from 'node:test';
import assert from 'node:assert/strict';

import {criarCycleHistoryRoutes} from '../../../../src/features/cycles/cycleHistory.routes.js';

//Cria dependências controladas e registra a ordem de configuração da rota.
function criarDependencias() {
    const chamadas = [];

    const router = {
        use(...argumentos) {
            chamadas.push([
                'use',
                ...argumentos
            ]);
        },

        get(...argumentos) {
            chamadas.push([
                'get',
                ...argumentos
            ]);
        }
    };

    function autenticar() {}
    function listarHistorico() {}

    return {
        dependencias: {
            Router() {
                return router;
            },
            authMiddleware: {
                autenticar
            },
            cycleHistoryController: {
                listarHistorico
            }
        },
        chamadas,
        autenticar,
        listarHistorico,
        router
    };
}

test('registra o endpoint de histórico com autenticação', () => {
    const {dependencias, chamadas, autenticar, listarHistorico} = criarDependencias();

    criarCycleHistoryRoutes(dependencias);

    assert.deepEqual(chamadas, [
        [
            'use',
            autenticar
        ],
        [
            'get',
            '/history',
            listarHistorico
        ]
    ]);
});

test('registra a autenticação antes do controller', () => {
    const ordem = [];

    function autenticar() {}
    function listarHistorico() {}

    criarCycleHistoryRoutes({
        Router() {
            return {
                use(middleware) {
                    ordem.push(middleware.name);
                },

                get(_caminho, controller) {
                    ordem.push(controller.name);
                }
            };
        },
        authMiddleware: {
            autenticar
        },
        cycleHistoryController: {
            listarHistorico
        }
    });

    assert.deepEqual(ordem, [
        'autenticar',
        'listarHistorico'
    ]);
});

test('devolve o mesmo router criado pela dependência', () => {
    const {dependencias, router} = criarDependencias();

    const resultado = criarCycleHistoryRoutes(dependencias);

    assert.equal(resultado, router);
});

test('não registra métodos de escrita no histórico', () => {
    const metodosRegistrados = [];

    criarCycleHistoryRoutes({
        Router() {
            return {
                use() {
                    metodosRegistrados.push('use');
                },

                get() {
                    metodosRegistrados.push('get');
                },

                post() {
                    metodosRegistrados.push('post');
                },

                patch() {
                    metodosRegistrados.push('patch');
                },

                delete() {
                    metodosRegistrados.push('delete');
                }
            };
        },
        authMiddleware: {
            autenticar() {}
        },
        cycleHistoryController: {
            listarHistorico() {}
        }
    });

    assert.deepEqual(metodosRegistrados, [
        'use',
        'get'
    ]);
});

test('rejeita Router ausente', () => {
    assert.throws(() => criarCycleHistoryRoutes({
        authMiddleware: {
            autenticar() {}
        },
        cycleHistoryController: {
            listarHistorico() {}
        }
    }), {
        name: 'TypeError',
        message: 'O Router do histórico de ciclos é inválido.'
    });
});

test('rejeita middleware de autenticação ausente', () => {
    assert.throws(() => criarCycleHistoryRoutes({
        Router() {
            return {};
        },
        cycleHistoryController: {
            listarHistorico() {}
        }
    }), {
        name: 'TypeError',
        message: 'O middleware de autenticação do histórico é inválido.'
    });
});

test('rejeita controller ausente', () => {
    assert.throws(() => criarCycleHistoryRoutes({
        Router() {
            return {};
        },
        authMiddleware: {
            autenticar() {}
        }
    }), {
        name: 'TypeError',
        message: 'O controller do histórico de ciclos é inválido.'
    });
});