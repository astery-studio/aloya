//Testa a proteção e a ordem de execução das rotas de ciclo.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCalendarRoutes } from '../../../../src/features/calendar/routes/calendar.routes.js';

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
    function buscarMes() {}
    function buscarEstadoAtual() {}

    return {
        chamadas,
        router,
        dependencias: {
            Router() {
                return router;
            },
            authMiddleware: {
                autenticar
            },
            calendarController: {
                buscarMes,
                buscarEstadoAtual
            }
        }
    };
}

test('rejeita configuração com dependências incompletas', () => {
    const {dependencias} = criarDependencias();

    const entradasInvalidas = [
        undefined,
        null,
        {},
        {
            ...dependencias,
            Router: null
        },
        {
            ...dependencias,
            authMiddleware: null
        },
        {
            ...dependencias,
            calendarController: null
        },
        {
            ...dependencias,
            calendarController: {
                buscarMes() {}
            }
        },
        {
            ...dependencias,
            calendarController: {
                buscarEstadoAtual() {}
            }
        }
    ];

    for (const entrada of entradasInvalidas) {
        assert.throws(
            () => criarCalendarRoutes(entrada),
            {
                name: 'TypeError',
                message: 'Não foi possível configurar as rotas do calendário.'
            }
        );
    }
});

test('protege as rotas antes de executar os controllers', () => {
    const {
        chamadas,
        dependencias
    } = criarDependencias();

    criarCalendarRoutes(dependencias);

    assert.deepEqual(chamadas, [
        [
            'use',
            dependencias.authMiddleware.autenticar
        ],
        [
            'get',
            '/calendar',
            dependencias.calendarController.buscarMes
        ],
        [
            'get',
            '/current',
            dependencias.calendarController.buscarEstadoAtual
        ]
    ]);
});

test('devolve o roteador configurado', () => {
    const {
        router,
        dependencias
    } = criarDependencias();

    assert.equal(
        criarCalendarRoutes(dependencias),
        router
    );
});
