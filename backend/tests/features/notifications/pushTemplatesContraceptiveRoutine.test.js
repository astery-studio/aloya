import assert from 'node:assert/strict';
import test from 'node:test';
import { renderizarPush } from '../../../src/features/notifications/pushTemplates.js';
import { agora, aviso, banco } from './pushTemplateFixture.js';

test('identifica a pausa programada e a retomada pelo nome cadastrado', async () => {
    const prisma = {
        ...banco('2000-01-01', true),
        anticoncepcional: {
            findFirst: async ({ where }) => {
                assert.deepEqual(where, { id: 7, usuarioId: 1, ativo: true });
                return { nome: 'Pílula cadastrada' };
            }
        }
    };
    for (const [tipo, title, trecho] of [
        [
            'inicioPausa',
            'Início da pausa do anticoncepcional',
            /pausa programada para Pílula cadastrada/
        ],
        [
            'fimPausa',
            'Fim da pausa do anticoncepcional',
            /último dia da pausa de Pílula cadastrada/
        ],
        ['retomada', 'Retomada do anticoncepcional', /retomar o uso de Pílula cadastrada/]
    ]) {
        const evento = { ...aviso, evento: `anticoncepcional.rotina.${tipo}`, origemId: 7 };
        const detalhada = await renderizarPush(prisma, evento, agora);
        assert.equal(detalhada.title, title);
        assert.match(detalhada.body, trecho);
        const discreta = await renderizarPush(banco('2000-01-01', false), evento, agora);
        assert.equal(discreta.title, 'Lembrete programado');
    }
});

test('distingue troca, retirada e aplicação após a pausa do adesivo cadastrado', async () => {
    const prisma = {
        ...banco('2000-01-01', true),
        anticoncepcional: { findFirst: async () => ({ nome: 'Adesivo cadastrado' }) }
    };
    for (const [tipo, acao] of [
        ['troca', 'sem iniciar a pausa'],
        ['retirada', 'marca o início da pausa'],
        ['novo', 'A pausa programada terminou']
    ]) {
        const evento = { ...aviso, evento: `anticoncepcional.adesivo.${tipo}`, origemId: 7 };
        const { title, body } = await renderizarPush(prisma, evento, agora);
        assert.match(title, /adesivo anticoncepcional/);
        assert.match(body, /Adesivo cadastrado/);
        assert.ok(body.includes(acao));
    }
});
