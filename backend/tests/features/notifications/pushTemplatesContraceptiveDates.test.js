import assert from 'node:assert/strict';
import test from 'node:test';
import { renderizarPush } from '../../../src/features/notifications/pushTemplates.js';
import { agora, aviso, banco } from './pushTemplateFixture.js';

test('identifica o anticoncepcional e a data de validade somente na prévia detalhada', async () => {
    const metodo = { nome: 'Meu anticoncepcional', dataValidade: new Date('2026-11-30') };
    const anticoncepcional = {
        findFirst: async ({ where }) => {
            assert.deepEqual(where, { id: 7, usuarioId: 1, ativo: true });
            return metodo;
        }
    };
    for (const [tipo, title] of [
        ['proxima', 'Seu anticoncepcional está perto de vencer'],
        ['atingida', 'Seu anticoncepcional chegou à data de validade']
    ]) {
        const evento = { ...aviso, evento: `anticoncepcional.validade.${tipo}`, origemId: 7 };
        const detalhada = await renderizarPush(
            { ...banco('2000-01-01', true), anticoncepcional },
            evento,
            agora
        );
        assert.equal(detalhada.title, title);
        assert.match(detalhada.body, /Meu anticoncepcional é 30 de novembro/);

        const discreta = await renderizarPush(banco('2000-01-01', false), evento, agora);
        assert.doesNotMatch(
            `${discreta.title} ${discreta.body}`,
            /Meu anticoncepcional|30 de novembro/
        );
    }
});

test('mostra a data da aplicação do injetável, inclusive no aviso antecipado', async () => {
    const prisma = {
        ...banco('2000-01-01', true),
        anticoncepcional: { findFirst: async () => ({ nome: 'Injetável cadastrado' }) }
    };
    for (const [tipo, dataProgramada] of [
        ['proxima', '2026-11-21T23:00:00Z'],
        ['hoje', '2026-11-29T00:30:00Z']
    ]) {
        const evento = {
            ...aviso,
            evento: `anticoncepcional.injetavel.${tipo}`,
            origemId: 7,
            ocorrencia: '7:2026-11-28',
            dataHoraProgramada: new Date(dataProgramada)
        };
        const { title, body } = await renderizarPush(prisma, evento, agora);
        assert.match(title, /aplicação do anticoncepcional/i);
        assert.match(body, /Injetável cadastrado.*28 de novembro/);
    }
});
