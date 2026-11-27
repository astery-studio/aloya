import assert from 'node:assert/strict';
import test from 'node:test';
import { registrarDispositivo } from '../../../src/features/notifications/pushDevices.routes.js';
import { agendarEvento } from '../../../src/features/notifications/notificationEvents.service.js';
import { criarPushWorker } from '../../../src/features/notifications/pushWorker.js';
import { aparelho, criarBanco } from './pushWorkerFixture.js';

test('worker de contatos mantém eventos pessoais fora da fila de envio', async (t) => {
    const prisma = await criarBanco(t);
    const agora = new Date('2026-10-01T20:00:00Z');
    const dados = {
        usuarioId: 1,
        ocorrencia: 'teste',
        tipoOrigem: 'rede_apoio',
        dataHoraProgramada: agora
    };
    const pessoal = await agendarEvento(prisma, { ...dados, evento: 'seguranca.senha.alterada' });
    const contato = await agendarEvento(prisma, { ...dados, evento: 'redeApoio.convites.contaExcluida' });
    const processados = [];
    const worker = criarPushWorker({
        prisma,
        provider: {},
        prefixoEvento: 'redeApoio.',
        relogio: () => agora,
        elegivel: (_prisma, aviso) => {
            processados.push(aviso.id);
            return false;
        }
    });

    await worker.processar();
    assert.deepEqual(processados, [contato]);
    const avisoPessoal = await prisma.notificacao.findUnique({ where: { id: pessoal } });
    assert.equal(avisoPessoal.statusEnvio, 'agendada');
});

test('fila registra tickets e recibos, retenta erro explícito e bloqueia token de conta trocada', async (t) => {
    const prisma = await criarBanco(t);
    const movel = aparelho();
    const segundo = aparelho('ios');
    await registrarDispositivo(prisma, { id: 1, sessaoId: 1 }, movel);
    await registrarDispositivo(prisma, { id: 1, sessaoId: 1 }, segundo);
    const agora = new Date('2026-10-01T20:00:00Z');
    let relogio = agora;
    const aviso = {
        usuarioId: 1,
        evento: 'seguranca.senha.alterada',
        ocorrencia: 'alteracao',
        tipoOrigem: 'seguranca',
        dataHoraProgramada: agora
    };
    const avisoId = await agendarEvento(prisma, aviso);
    assert.equal(avisoId, await agendarEvento(prisma, aviso));
    const chamadas = [];
    const provider = {
        async enviar(mensagem) {
            chamadas.push(mensagem);
            if (mensagem.to === movel.token)
                return { status: 'error', details: { error: 'MessageRateExceeded' } };
            return { status: 'ok', id: 'ticket-ios' };
        },
        async recibos() {
            return { 'ticket-ios': { status: 'ok' } };
        }
    };
    const iniciar = () => criarPushWorker({ prisma, provider, relogio: () => relogio });
    await Promise.all([iniciar().processar(), iniciar().processar()]);
    assert.equal(chamadas.length, 2);
    assert.deepEqual(chamadas[0].data, { notificacaoId: String(avisoId) });
    assert.equal(chamadas[0].title, 'Lembrete programado');
    await registrarDispositivo(prisma, { id: 2, sessaoId: 2 }, movel);
    relogio = new Date(+agora + 16 * 60000);
    await iniciar().processar();
    assert.equal(chamadas.length, 2);
    const estados = await prisma.entregaPush.findMany({ select: { status: true } });
    assert.deepEqual(estados.map(({ status }) => status).sort(), ['cancelada', 'encaminhada']);
});
