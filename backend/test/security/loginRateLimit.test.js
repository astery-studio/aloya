import test from 'node:test';
import assert from 'node:assert/strict';

import { criarContaLoginRateLimit } from '../../src/middlewares/rateLimit.middleware.js';

test('agrupa tentativas distribuídas pelo e-mail normalizado', () => {
    let opcoes;
    const rateLimit = (configuracao) => {
        opcoes = configuracao;
        return () => {};
    };

    criarContaLoginRateLimit({ rateLimit, janelaMs: 60000, limite: 5 });

    const primeira = opcoes.keyGenerator({
        body: { email: '  ALVO@EMAIL.COM ' }
    });
    const segunda = opcoes.keyGenerator({
        body: { email: 'alvo@email.com' }
    });

    assert.equal(primeira, 'alvo@email.com');
    assert.equal(segunda, primeira);
    assert.equal(opcoes.skipSuccessfulRequests, true);
});

test('bloqueio por conta não expõe o e-mail', () => {
    let opcoes;
    const eventos = [];
    const logger = { warn: (evento) => eventos.push(evento) };
    const res = {
        status(codigo) { this.codigo = codigo; return this; },
        json(corpo) { this.corpo = corpo; return this; }
    };

    criarContaLoginRateLimit({
        rateLimit: (configuracao) => { opcoes = configuracao; return () => {}; },
        janelaMs: 60000,
        limite: 5,
        logger
    });
    opcoes.handler({ method: 'POST', originalUrl: '/auth/login' }, res);

    assert.equal(res.codigo, 429);
    assert.equal(JSON.stringify(res.corpo).includes('email'), false);
    assert.equal(Object.hasOwn(eventos[0], 'email'), false);
});
