import assert from 'node:assert/strict';
import test from 'node:test';
import { criarPushWorker } from '../../../src/features/notifications/pushWorker.js';
import { reconciliarAgendamentos } from '../../../src/features/notifications/notificationPlanner.js';
import { eventoDicas as evento, prepararAgendaDicas as preparar } from './sharedCareTipsFixture.js';

test('desligar o grupo cancela o aviso já em fila e a retentativa sem chamar o provedor', async (t) => {
    const { prisma, preferencias, agora } = await preparar(t);
    const enviados = [];
    let relogio = agora;
    const worker = criarPushWorker({
        prisma,
        relogio: () => relogio,
        provider: {
            enviar: async (msg) => {
                enviados.push(msg);
                return { status: 'error', details: { error: 'MessageRateExceeded' } };
            }
        }
    });
    await worker.processar();
    assert.equal(enviados.length, 1);
    assert.equal(await prisma.entregaPush.count({ where: { status: 'pendente' } }), 1);

    await preferencias.atualizar(2, { chave: 'redeApoio.dicas', valor: false });
    assert.equal((await preferencias.buscar(2))[evento], false);
    assert.equal(await prisma.entregaPush.count({ where: { status: 'cancelada' } }), 1);
    relogio = new Date(+agora + 3 * 60000);
    await worker.processar();
    assert.equal(enviados.length, 1);
    assert.equal(await prisma.notificacao.count({ where: { evento, statusEnvio: 'agendada' } }), 0);
});

test('desligar um aviso individual impede retomar o agendamento com uma agenda antiga', async (t) => {
    const { prisma, preferencias, agenda, agora } = await preparar(t);
    let enviados = 0;
    await preferencias.atualizar(2, { chave: evento, valor: false });
    await reconciliarAgendamentos(prisma, 2, agenda);
    const worker = criarPushWorker({
        prisma,
        relogio: () => agora,
        provider: { enviar: async () => { enviados += 1; } }
    });

    await worker.processar();
    assert.equal(enviados, 0);
    assert.equal(await prisma.notificacao.count({ where: { evento, statusEnvio: 'agendada' } }), 0);
    assert.equal(await prisma.entregaPush.count(), 0);
    assert.equal((await preferencias.buscar(2))['redeApoio.dicas'], true);
});
