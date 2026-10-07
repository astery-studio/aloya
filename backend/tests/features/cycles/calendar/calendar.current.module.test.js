//Testa a composição do estado atual dentro do módulo do calendário.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCalendarModule } from '../../../../src/features/cycles/calendar/calendar.module.js';

test('compõe o estado atual usando o relógio recebido', async () => {
    const prisma = {
        usuario: {
            async findUnique() {
                return {
                    duracaoCicloInformada: null,
                    duracaoMenstruacaoInformada: null,
                    duracaoLuteaInformada: 14,
                    _count: {
                        registrosCiclo: 0
                    },
                    registrosCiclo: []
                };
            }
        },
        registroCiclo: {
            async findMany() {
                assert.fail(
                    'O estado atual não deve carregar os dias do mês.'
                );
            }
        }
    };
    const modulo = criarCalendarModule({
        prisma,
        agora: () => new Date(
            '2026-10-10T15:00:00.000Z'
        )
    });

    assert.equal(
        typeof modulo.currentCycleService.buscarEstadoAtual,
        'function'
    );
    assert.equal(
        typeof modulo.calendarController.buscarMes,
        'function'
    );
    assert.equal(
        typeof modulo.calendarController.buscarEstadoAtual,
        'function'
    );
    assert.equal(
        Object.isFrozen(modulo.calendarController),
        true
    );

    const resultado = await modulo.currentCycleService.buscarEstadoAtual({
        usuarioId: 7
    });

    assert.deepEqual(resultado, {
        possuiCiclos: false,
        dataReferencia: '2026-10-10',
        diaDoCiclo: null,
        faseAtual: null,
        estaNaJanelaFertil: false,
        proximoInicioEstimado: null,
        nivelConfianca: null,
        statusPrevisao: null
    });
});