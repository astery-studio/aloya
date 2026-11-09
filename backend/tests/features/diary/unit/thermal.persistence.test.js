import assert from 'node:assert/strict';
import test from 'node:test';

import { persistirAnaliseTermica } from '../../../../src/features/diary/thermal/thermal.persistence.js';

test('persiste cada estado sem aplicar evidência na HU-013', async () => {
    const gravacoes = [];
    const tx = { analiseTermicaCiclo: { upsert: async (dados) => gravacoes.push(dados) } };
    const config = { algoritmo: 'motor', versao: '1', variante: 'A1', disponibilidade: 'B1' };
    const esperados = {
        ELEVACAO_DETECTADA: 'elevacao_detectada',
        INCONCLUSIVO: 'inconclusivo',
        NENHUMA_ELEVACAO_IDENTIFICADA: 'nenhuma_elevacao_identificada',
        DADOS_INSUFICIENTES: 'dados_insuficientes'
    };
    for (const [estado, persistido] of Object.entries(esperados)) {
        await persistirAnaliseTermica(
            tx, { id: 7 }, 3, config,
            { estado, janelasAvaliaveis: 0, sequencias: [] }, true, null
        );
        assert.equal(gravacoes.at(-1).create.estado, persistido);
        assert.equal(gravacoes.at(-1).create.evidenciaAplicada, false);
    }
    assert.equal(gravacoes[0].where.registroCicloId_versaoAlgoritmo_variante_disponibilidade.registroCicloId, 7);
});
