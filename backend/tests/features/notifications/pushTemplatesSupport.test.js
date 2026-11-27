import assert from 'node:assert/strict';
import test from 'node:test';
import { renderizarPush } from '../../../src/features/notifications/pushTemplates.js';
import { agora, aviso, banco } from './pushTemplateFixture.js';

test('explica a expiração do link sem expor dados do responsável no push', async () => {
    const evento = { ...aviso, evento: 'redeApoio.consentimento.expirado' };
    const conteudo = await renderizarPush(banco('2016-01-01', true), evento, agora);
    assert.equal(conteudo.title, 'Acesso à Rede de Apoio');
    assert.match(conteudo.body, /link para liberar sua Rede de Apoio venceu/);
    assert.doesNotMatch(conteudo.body, /responsável|e-mail/);
});

test('contextualiza avisos da agenda compartilhada e conserva a discrição', async () => {
    for (const [tipo, trecho] of [
        ['horario', 'horário previsto'],
        ['aplicacoesTrocas', 'ação programada'],
        ['moderados', 'aguarda confirmação'],
        ['fimJanela', 'prazo do lembrete terminou']
    ]) {
        const evento = {
            ...aviso,
            evento: `redeApoio.anticoncepcional.${tipo}`,
            ocorrencia: 'anticoncepcional.rotina.horario:7:2026-11-26:20:00'
        };
        const { title, body } = await renderizarPush(banco('2000-01-01', true), evento, agora);
        assert.match(title, /Rede de Apoio/);
        assert.ok(body.includes(trecho));
        assert.doesNotMatch(`${title} ${body}`, /anticoncepcional|20:00/);
    }
});
