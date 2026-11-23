import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDiaryPreferencesRateLimit } from '../../../../src/features/diary/middleware/diaryPreferencesRateLimit.middleware.js';

test('limita preferências do Diário sem compartilhar o limite da conta', () => {
    let configuracao;
    const logs = [];
    const middleware = criarDiaryPreferencesRateLimit({
        rateLimit: (valor) => {
            configuracao = valor;
            return valor;
        },
        janelaMs: 900000,
        limite: 120,
        logger: { warn: (valor) => logs.push(valor) }
    });

    assert.equal(middleware.limit, 120);
    assert.equal(middleware.windowMs, 900000);
    assert.equal(middleware.keyGenerator({ usuario: { id: 7 } }), 'usuario:7');

    const resposta = {
        status(codigo) {
            this.codigo = codigo;
            return this;
        },
        json(corpo) {
            this.corpo = corpo;
            return this;
        }
    };
    configuracao.handler(
        { usuario: { id: 7 }, method: 'PATCH', originalUrl: '/api/diario/preferencias' },
        resposta
    );

    assert.equal(resposta.codigo, 429);
    assert.equal(resposta.corpo.erro.codigo, 'LIMITE_PREFERENCIAS_DIARIO');
    assert.equal(logs[0].evento, 'limite_preferencias_diario');
});

test('rejeita configuração inválida do limitador de preferências', () => {
    assert.throws(() => criarDiaryPreferencesRateLimit(), TypeError);
    assert.throws(
        () => criarDiaryPreferencesRateLimit({ rateLimit: () => {}, janelaMs: 0, limite: 1 }),
        TypeError
    );
    assert.throws(
        () => criarDiaryPreferencesRateLimit({ rateLimit: () => {}, janelaMs: 1, limite: 0 }),
        TypeError
    );
});
