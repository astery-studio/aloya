import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleEditService } from '../../../../src/features/cycles/services/cycleEdit.service.js';

test('rejeita Prisma inválido', () => {
    assert.throws(() => criarCycleEditService(), /Prisma/);
    assert.throws(() => criarCycleEditService({ prisma: { $transaction: true } }), /Prisma/);
});

test('não revela um ciclo inexistente na consulta', async () => {
    const service = criarCycleEditService({
        prisma: {
            $transaction() {},
            registroCiclo: { async findFirst() { return null; } }
        }
    });
    await assert.rejects(() => service.buscar({ usuarioId: 2, cicloId: 9 }), {
        status: 404, codigo: 'CICLO_NAO_ENCONTRADO'
    });
});

test('apresenta datas abertas e encerradas no formato do calendário', async () => {
    const resultados = [
        { id: 1, dataInicio: new Date('2026-10-01Z'), dataFim: null },
        { id: 2, dataInicio: new Date('2026-09-01Z'), dataFim: new Date('2026-09-05Z') }
    ];
    const service = criarCycleEditService({
        prisma: {
            $transaction() {},
            registroCiclo: { async findFirst() { return resultados.shift(); } }
        }
    });
    assert.deepEqual(await service.buscar({ usuarioId: 2, cicloId: 1 }), {
        id: 1, dataInicio: '2026-10-01', dataFim: null
    });
    assert.deepEqual(await service.buscar({ usuarioId: 2, cicloId: 2 }), {
        id: 2, dataInicio: '2026-09-01', dataFim: '2026-09-05'
    });
});
