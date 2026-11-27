import assert from 'node:assert/strict';
import test from 'node:test';
import { renderizarPush } from '../../../src/features/notifications/pushTemplates.js';
import { agora, aviso, banco } from './pushTemplateFixture.js';

test('unifica os títulos de uso não confirmado e identifica o último alerta', async () => {
    const prisma = {
        ...banco('2000-01-01', true),
        anticoncepcional: { findFirst: async () => ({ nome: 'Pílula cadastrada' }) }
    };
    for (const fase of ['aviso', 'moderados', 'criticos', 'fimJanela']) {
        const evento = {
            ...aviso,
            evento: `anticoncepcional.naoConfirmado.${fase}`,
            origemId: 7,
            ocorrencia: '7:2026-11-26:18:00:120'
        };
        const { title, body } = await renderizarPush(prisma, evento, agora);
        assert.equal(title, 'Confirmação de uso pendente');
        assert.match(body, /Pílula cadastrada às 18:00/);
        assert.equal(body.includes('O prazo deste lembrete terminou.'), fase === 'fimJanela');
    }
});
