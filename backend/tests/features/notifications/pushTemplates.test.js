import assert from 'node:assert/strict';
import test from 'node:test';
import { criarPayloadPush } from '../../../src/features/notifications/pushProvider.js';
import { renderizarPush } from '../../../src/features/notifications/pushTemplates.js';
import { agora, aviso, banco } from './pushTemplateFixture.js';

test('reproduz o texto do Diário quando uma pessoa adulta opta por prévia detalhada', async () => {
    const conteudo = await renderizarPush(banco('2000-01-01', true), aviso, agora);
    assert.equal(conteudo.title, 'Que tal atualizar seu diário hoje?');
    assert.match(conteudo.body, /^Registre como você está se sentindo hoje/);
});

test('usa a data prevista e explica separadamente os três níveis de confiabilidade', async () => {
    const evento = { ...aviso, evento: 'ciclo.menstrual.proxima', ocorrencia: '2026-11-29' };

    for (const [quantidadeRegistros, trecho] of [
        [7, 'durações parecidas'],
        [4, 'já dão uma referência'],
        [1, 'pode variar bastante']
    ]) {
        const prisma = banco('2000-01-01', true);
        const dadosDaConta = await prisma.usuario.findUnique();
        const registrosCiclo = Array.from({ length: quantidadeRegistros }, (_, indice) => ({
            dataInicio: new Date(Date.UTC(2026, 10, 1 - indice * 28)),
            dataFim: null
        }));
        prisma.usuario.findUnique = async () => ({ ...dadosDaConta, registrosCiclo });

        const mensagem = await renderizarPush(prisma, evento, agora);
        assert.match(mensagem.body, /pode começar por volta de 29 de novembro/);
        assert.ok(mensagem.body.includes(trecho), mensagem.body);
    }
});

test('oculta dados de menores e respeita a opção de prévia discreta', async () => {
    for (const [nascimento, previa] of [
        ['2016-01-01', true],
        ['2000-01-01', false]
    ]) {
        const conteudo = await renderizarPush(banco(nascimento, previa), aviso, agora);
        const payload = criarPayloadPush(aviso, 'ExpoPushToken[teste]', agora, conteudo);
        assert.equal(payload.title, 'Lembrete programado');
        assert.doesNotMatch(payload.body, /diário|ciclo/);
        assert.deepEqual(payload.data, { notificacaoId: '41' });
        assert.equal(payload.channelId, 'ciclo');
        assert.equal(payload.ttl, 14400);
    }
});
