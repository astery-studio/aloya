import assert from 'node:assert/strict';
import test from 'node:test';
import { criarNotificationPreferencesService } from '../../../src/features/notifications/notificationPreferences.service.js';
import { reconciliarAgendamentos } from '../../../src/features/notifications/notificationPlanner.js';
import { planejarCompartilhadas } from '../../../src/features/notifications/sharedPushPlanner.js';
import { criarVinculoDeTeste, criarWorkerDeTeste } from './sharedCareTipsFixture.js';

test('agenda dicas para o contato e revalida consentimento e permissão antes do envio', async (t) => {
    const { prisma, dispositivo, vinculo, darPermissao, marcarTitularMenor, liberarConsentimento } =
        await criarVinculoDeTeste(t);
    const evento = 'redeApoio.dicas.apoio';
    const prefs = criarNotificationPreferencesService(prisma);
    let agora = new Date('2026-10-01T16:00:00Z');
    const planejar = async () =>
        planejarCompartilhadas(
            prisma,
            2,
            await prisma.preferenciaNotificacao.findUnique({ where: { usuarioId: 2 } }),
            agora
        );
    await prefs.atualizar(2, { chave: evento, valor: true });
    assert.deepEqual(await planejar(), []);

    await darPermissao(['geral.dicas']);
    await marcarTitularMenor();
    assert.deepEqual(await planejar(), []);
    await liberarConsentimento();
    const agenda = await planejar();
    assert.deepEqual(
        agenda.map(({ usuarioId, ocorrencia }) => [usuarioId, ocorrencia]),
        [
            [2, `${vinculo.id}:menstrual:2026-10-01`],
            [2, `${vinculo.id}:folicular:2026-10-01`]
        ]
    );
    await reconciliarAgendamentos(prisma, 2, agenda);
    await reconciliarAgendamentos(prisma, 2, await planejar());
    assert.equal(await prisma.notificacao.count({ where: { usuarioId: 2, evento } }), 2);

    agora = new Date('2026-10-13T16:00:00Z');
    assert.deepEqual(
        (await planejar()).map(({ ocorrencia }) => ocorrencia),
        [`${vinculo.id}:ovulatoria:2026-10-01`, `${vinculo.id}:lutea:2026-10-01`]
    );

    agora = new Date('2026-10-02T23:10:00Z');
    const { worker, enviados } = criarWorkerDeTeste(prisma, () => agora);
    await darPermissao([]);
    await worker.processar();
    assert.deepEqual(enviados, []);

    await darPermissao(['geral.dicas']);
    await reconciliarAgendamentos(prisma, 2, await planejar());
    await worker.processar();
    await worker.processar();
    assert.equal(enviados.length, 1);
    assert.equal(enviados[0].to, dispositivo.token);
    assert.match(enviados[0].body, /bolsa térmica/);
    assert.doesNotMatch(`${enviados[0].title} ${enviados[0].body}`, /menstrual|Teste/);

    await prefs.atualizar(2, { chave: evento, valor: false });
    assert.deepEqual(await planejar(), []);
});
