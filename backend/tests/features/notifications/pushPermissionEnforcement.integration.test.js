import assert from 'node:assert/strict';
import test from 'node:test';
import { podeProcessar } from '../../../src/features/notifications/pushEligibility.js';
import { criarPushWorker } from '../../../src/features/notifications/pushWorker.js';
import { prepararAgendaDicas as preparar } from './sharedCareTipsFixture.js';

test('revalida a permissão retirada depois que começou a preparar a entrega', async (t) => {
    const { prisma, darPermissao, agora } = await preparar(t);
    let verificacoes = 0;
    let enviados = 0;
    const worker = criarPushWorker({
        prisma,
        relogio: () => agora,
        provider: {
            enviar: async () => {
                enviados += 1;
            }
        },
        elegivel: async (...args) => {
            if (++verificacoes === 2) await darPermissao([]);
            return podeProcessar(...args);
        }
    });
    await worker.processar();
    assert.equal(verificacoes, 2);
    assert.equal(enviados, 0);
    assert.equal(await prisma.entregaPush.count({ where: { status: 'cancelada' } }), 1);
});
