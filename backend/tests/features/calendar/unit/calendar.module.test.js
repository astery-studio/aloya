//Testa a composição isolada das camadas do calendário.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCalendarModule } from '../../../../src/features/calendar/calendar.module.js';

function criarPrisma() {
    return {
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
                return [];
            }
        }
    };
}

test('rejeita composição sem Prisma compatível', () => {
    for (const prisma of [undefined, null, {}, {usuario: {findUnique() {}}}]) {
        assert.throws(
            () => criarCalendarModule({prisma}),
            {
                name: 'TypeError',
                message: 'Não foi possível configurar o repositório do calendário.'
            }
        );
    }
});

test('compõe repository, service e controller', () => {
    const modulo = criarCalendarModule({
        prisma: criarPrisma()
    });

    assert.equal(
        typeof modulo.calendarRepository.buscarDadosDoMes,
        'function'
    );
    assert.equal(
        typeof modulo.calendarService.buscarMes,
        'function'
    );
    assert.equal(
        typeof modulo.calendarController.buscarMes,
        'function'
    );
    assert.equal(
        Object.isFrozen(modulo),
        true
    );
});

test('mantém as camadas conectadas até a resposta HTTP', async () => {
    const modulo = criarCalendarModule({
        prisma: criarPrisma()
    });
    const resposta = {
        statusRecebido: null,
        corpoRecebido: null,
        cabecalhos: {},

        set(nome, valor) {
            this.cabecalhos[nome] = valor;
            return this;
        },

        status(status) {
            this.statusRecebido = status;
            return this;
        },

        json(corpo) {
            this.corpoRecebido = corpo;
            return this;
        }
    };

    await modulo.calendarController.buscarMes(
        {
            usuario: {
                id: 7
            },
            query: {
                mes: '2026-10'
            }
        },
        resposta,
        assert.fail
    );

    assert.equal(resposta.statusRecebido, 200);
    assert.deepEqual(resposta.corpoRecebido, {
        calendario: {
            mes: '2026-10',
            possuiCiclos: false,
            diasMenstruacao: [],
            previsao: null
        }
    });
});
