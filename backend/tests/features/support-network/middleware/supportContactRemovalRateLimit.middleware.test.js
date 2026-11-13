import assert from 'node:assert/strict';
import test from 'node:test';

import { criarSupportContactRemovalRateLimit } from '../../../../src/features/support-network/middleware/supportContactRemovalRateLimit.middleware.js';

test('limita remoções pela titular autenticada', () => {
    let opcoes;
    const middleware = () => {};
    const resultado = criarSupportContactRemovalRateLimit({
        rateLimit(configuracao) {
            opcoes = configuracao;
            return middleware;
        },
        janelaMs: 60000,
        limite: 4,
        logger: { warn() {} }
    });

    assert.equal(resultado, middleware);
    assert.equal(opcoes.keyGenerator({ usuario: { id: 12 } }), 'usuario:12');
    assert.equal(opcoes.windowMs, 60000);
    assert.equal(opcoes.limit, 4);
});

test('responde 429 sem registrar o corpo da confirmação', () => {
    let opcoes;
    const logs = [];
    criarSupportContactRemovalRateLimit({
        rateLimit(configuracao) {
            opcoes = configuracao;
            return () => {};
        },
        janelaMs: 60000,
        limite: 4,
        logger: {
            warn(valor) {
                logs.push(valor);
            }
        }
    });
    const estado = {};
    const res = {
        status(valor) {
            estado.status = valor;
            return this;
        },
        json(valor) {
            estado.body = valor;
            return this;
        }
    };

    opcoes.handler(
        {
            usuario: { id: 12 },
            method: 'DELETE',
            originalUrl: '/support-network/contacts/9',
            body: { confirmado: true }
        },
        res
    );

    assert.equal(estado.status, 429);
    assert.equal(estado.body.erro.codigo, 'LIMITE_REMOCAO_CONTATO');
    assert.equal(JSON.stringify(logs).includes('confirmado'), false);
});

test('rejeita configuração incompleta', () => {
    assert.throws(() => criarSupportContactRemovalRateLimit(), /configurar o limite/);
});
