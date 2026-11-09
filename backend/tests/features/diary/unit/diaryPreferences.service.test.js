import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDiaryPreferencesService } from '../../../../src/features/diary/services/diaryPreferences.service.js';

function criarCenario(contagem = 1) {
    const chamadas = [];
    const tx = {
        configuracaoDiario: {
            upsert: async (dados) => chamadas.push(['configuracao', dados]),
            updateMany: async () => ({ count: contagem })
        },
        preferenciaMacrocategoriaDiario: {
            upsert: async (dados) => chamadas.push(['macro', dados])
        },
        preferenciaCategoriaDiario: {
            upsert: async (dados) => chamadas.push(['categoria', dados])
        }
    };
    const prisma = { $transaction: async (operacao) => operacao(tx) };
    const bootstrap = {
        garantir: async () => chamadas.push(['bootstrap'])
    };

    return { prisma, bootstrap, chamadas };
}

test('atualiza macro e incrementa a versão atomicamente', async () => {
    const cenario = criarCenario();
    const service = criarDiaryPreferencesService(cenario);
    const resultado = await service.atualizar({
        usuarioId: 8,
        tipo: 'macrocategoria',
        id: 'energia_sono',
        ativa: false,
        versao: 2
    });

    assert.deepEqual(resultado, { id: 'energia_sono', ativa: false, versao: 3 });
    assert.equal(cenario.chamadas[0][0], 'bootstrap');
    assert.equal(cenario.chamadas.at(-1)[0], 'macro');
});

test('rejeita versão superada sem gravar preferência', async () => {
    const cenario = criarCenario(0);
    const service = criarDiaryPreferencesService(cenario);

    await assert.rejects(
        () =>
            service.atualizar({
                usuarioId: 8,
                tipo: 'categoria',
                id: 'energia',
                ativa: true,
                versao: 1
            }),
        { codigo: 'CONFLITO_PREFERENCIAS', status: 409 }
    );
    assert.equal(
        cenario.chamadas.some(([tipo]) => tipo === 'categoria'),
        false
    );
});

test('rejeita identificador fora do catálogo antes de acessar o banco', async () => {
    const cenario = criarCenario();
    const service = criarDiaryPreferencesService(cenario);

    await assert.rejects(
        () =>
            service.atualizar({ usuarioId: 8, tipo: 'categoria', id: 'x', ativa: true, versao: 0 }),
        { codigo: 'ITEM_CATALOGO_NAO_ENCONTRADO' }
    );
    assert.deepEqual(cenario.chamadas, []);
});
