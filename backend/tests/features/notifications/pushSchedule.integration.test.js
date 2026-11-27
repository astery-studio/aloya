import assert from 'node:assert/strict';
import test from 'node:test';
import { registrarDispositivo } from '../../../src/features/notifications/pushDevices.routes.js';
import { criarPushWorker } from '../../../src/features/notifications/pushWorker.js';
import {
    planejarConta,
    reconciliarAgendamentos
} from '../../../src/features/notifications/notificationPlanner.js';
import { lerPoliticaDeAlertas } from '../../../src/features/notifications/contraceptivePushPolicy.js';
import { aparelho, criarBanco } from './pushWorkerFixture.js';

test('planeja no fuso civil, reagenda e cancela lembrete quando o diário é preenchido', async (t) => {
    const prisma = await criarBanco(t);
    await registrarDispositivo(prisma, { id: 1, sessaoId: 1 }, aparelho());
    const agora = new Date('2026-10-01T20:00:00Z');
    const agendar = async (horarioLembreteDiario) =>
        reconciliarAgendamentos(
            prisma,
            1,
            await planejarConta(prisma, 1, { horarioLembreteDiario }, agora)
        );

    await agendar('20:00');
    await agendar('21:00');
    const avisos = await prisma.notificacao.findMany({ orderBy: { ocorrencia: 'asc' } });
    assert.equal(avisos.length, 2);
    assert.equal(avisos[0].dataHoraProgramada.toISOString(), '2026-10-02T00:00:00.000Z');
    const preferencia = { horarioLembreteDiario: '21:00' };
    await prisma.preferenciaNotificacao.create({ data: { usuarioId: 1, ...preferencia } });
    await prisma.registroDiario.create({
        data: { usuarioId: 1, dataRegistro: new Date('2026-10-01') }
    });

    const worker = criarPushWorker({
        prisma,
        relogio: () => new Date('2026-10-02T00:10:00Z'),
        provider: { enviar: () => assert.fail('Diário preenchido não deve gerar push.') }
    });
    await worker.processar();
    assert.equal(
        (await prisma.notificacao.findUnique({ where: { id: avisos[0].id } })).statusEnvio,
        'cancelada'
    );
});

test('reenvios clínicos exigem janela explícita e estágios crescentes', () => {
    assert.equal(lerPoliticaDeAlertas(undefined, {}).size, 0);
    assert.throws(() => lerPoliticaDeAlertas('{"1":{"aviso":[10]}}', {}));
    assert.throws(() => lerPoliticaDeAlertas('{"1":{"aviso":[10],"criticos":[8]}}', { 1: 60 }));
    assert.deepEqual(lerPoliticaDeAlertas('{"1":{"aviso":[10]}}', { 1: 60 }).get(1), [
        { fase: 'aviso', atraso: 10 },
        { fase: 'fimJanela', atraso: 60 }
    ]);
});
