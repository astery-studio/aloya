import assert from 'node:assert/strict';
import test from 'node:test';
import { criarPayloadPush } from '../../../src/features/notifications/pushProvider.js';
import { renderizarPush } from '../../../src/features/notifications/pushTemplates.js';

const agora = new Date('2026-11-26T20:00:00Z');
const aviso = {
    id: 41,
    usuarioId: 1,
    evento: 'ciclo.diario.lembrete',
    dataHoraProgramada: agora,
    expiraEm: new Date('2026-11-27T00:00:00Z')
};

function banco(dataNascimento, previaDetalhada) {
    return {
        usuario: {
            findUnique: async () => ({
                dataNascimento: new Date(dataNascimento),
                preferenciaNotificacao: { ajustesPorEvento: { previaDetalhada } }
            })
        }
    };
}

test('reproduz o texto do Diário quando uma pessoa adulta opta por prévia detalhada', async () => {
    const conteudo = await renderizarPush(banco('2000-01-01', true), aviso, agora);
    assert.equal(conteudo.title, 'Que tal atualizar seu diário hoje?');
    assert.match(conteudo.body, /^Registre como você está se sentindo hoje/);
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
