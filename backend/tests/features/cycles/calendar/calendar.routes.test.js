//Testa a proteção e a ordem de execução da rota mensal do calendário.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCalendarRoutes } from '../../../../src/features/cycles/calendar/calendar.routes.js';

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
                buscarMes
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

test('protege a rota antes de executar o controller', () => {
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