import assert from 'node:assert/strict';
import test from 'node:test';
import { criarNotificationPreferencesService } from '../../../src/features/notifications/notificationPreferences.service.js';
import {
    planejarConta,
    reconciliarAgendamentos
} from '../../../src/features/notifications/notificationPlanner.js';
import { registrarDispositivo } from '../../../src/features/notifications/pushDeviceRegistration.js';
import { renderizarPush } from '../../../src/features/notifications/pushTemplates.js';
import { criarPushWorker } from '../../../src/features/notifications/pushWorker.js';
import { aparelho, criarBanco } from './pushWorkerFixture.js';

test('agenda dicas distintas nos dias da fase, com retentativa segura e cancelamento', async (t) => {
    const prisma = await criarBanco(t);
    await registrarDispositivo(prisma, { id: 1, sessaoId: 1 }, aparelho());
    await prisma.usuario.update({ where: { id: 1 }, data: { duracaoMenstruacaoInformada: 7 } });
    await prisma.registroCiclo.create({ data: { usuarioId: 1, dataInicio: new Date('2026-10-01') } });
    const service = criarNotificationPreferencesService(prisma);
    await service.atualizar(1, { chave: 'ciclo.dicas.menstrual', valor: true });
    await service.atualizar(1, { chave: 'ciclo.fases.menstrual', valor: true });
    let agora = new Date('2026-10-01T20:00:00Z');
    const planejar = async () =>
        planejarConta(
            prisma,
            1,
            await prisma.preferenciaNotificacao.findUnique({ where: { usuarioId: 1 } }),
            agora
        );
    const agenda = await planejar();
    const dicas = agenda.filter(({ evento }) => evento.startsWith('ciclo.dicas.'));
    assert.deepEqual(
        dicas.map(({ ocorrencia }) => ocorrencia),
        ['2026-10-02', '2026-10-04', '2026-10-06']
    );
    assert.ok(agenda.some(({ evento }) => evento === 'ciclo.fases.menstrual'));
    assert.equal((await renderizarPush(prisma, dicas[0], agora)).title, 'Uma dica de autocuidado');
    await service.atualizar(1, { chave: 'previaDetalhada', valor: true });
    const textos = await Promise.all(dicas.map((dica) => renderizarPush(prisma, dica, agora)));
    assert.equal(new Set(textos.map(({ body }) => body)).size, 3);

    await reconciliarAgendamentos(prisma, 1, agenda);
    await reconciliarAgendamentos(prisma, 1, await planejar());
    const where = { usuarioId: 1, evento: 'ciclo.dicas.menstrual' };
    assert.equal(await prisma.notificacao.count({ where }), 3);

    agora = new Date('2026-10-02T23:15:00Z');
    const enviados = [];
    const worker = criarPushWorker({
        prisma,
        relogio: () => agora,
        provider: {
            enviar: async ({ title }) => {
                enviados.push(title);
                return { status: 'ok', id: 'ticket' };
            }
        }
    });
    await worker.processar();
    await worker.processar();
    assert.equal(enviados.filter((title) => title === textos[0].title).length, 1);

    await service.atualizar(1, { chave: 'ciclo.dicas', valor: false });
    const futuras = { ...where, ocorrencia: { gt: '2026-10-02' } };
    assert.equal(
        await prisma.notificacao.count({ where: { ...futuras, statusEnvio: 'cancelada' } }),
        2
    );
    assert.ok(!(await planejar()).some(({ evento }) => evento.startsWith('ciclo.dicas.')));
});
