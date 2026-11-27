import assert from 'node:assert/strict';
import test from 'node:test';
import rateLimit from 'express-rate-limit';

import { criarContactInvitationResponseRateLimit } from '../../../../src/features/support-network/middleware/contactInvitationResponseRateLimit.middleware.js';

test('limita por IP antes do login e por usuário depois do login', () => {
    let configuracao;
    criarContactInvitationResponseRateLimit({
        rateLimit(opcoes) {
            configuracao = opcoes;
            return () => {};
        },
        janelaMs: 60_000,
        limite: 10
    });

    assert.equal(configuracao.keyGenerator({ ip: '127.0.0.1' }), 'ip:127.0.0.1');
    assert.equal(configuracao.keyGenerator({ ip: '127.0.0.1', usuario: { id: 25 } }), 'usuario:25');
});

test('normaliza endereços IPv6 para impedir desvio do limite', () => {
    let configuracao;
    criarContactInvitationResponseRateLimit({
        rateLimit(opcoes) {
            configuracao = opcoes;
            return () => {};
        },
        janelaMs: 60_000,
        limite: 10
    });

    const primeiraChave = configuracao.keyGenerator({ ip: '2001:db8:abcd:1200::1' });
    const segundaChave = configuracao.keyGenerator({ ip: '2001:db8:abcd:12ff::9' });
    const outraSubrede = configuracao.keyGenerator({ ip: '2001:db8:abcd:1300::1' });

    assert.equal(primeiraChave, segundaChave);
    assert.notEqual(primeiraChave, outraSubrede);
});

test('é aceito pelas validações de segurança do express-rate-limit', () => {
    assert.doesNotThrow(() =>
        criarContactInvitationResponseRateLimit({
            rateLimit,
            janelaMs: 60_000,
            limite: 10
        })
    );
});

test('não registra token, URL ou decisão ao bloquear', () => {
    let configuracao;
    const logs = [];
    criarContactInvitationResponseRateLimit({
        rateLimit(opcoes) {
            configuracao = opcoes;
            return () => {};
        },
        janelaMs: 60_000,
        limite: 10,
        logger: {
            warn(dados) {
                logs.push(dados);
            }
        }
    });
    const resposta = {
        statusCode: null,
        body: null,
        status(valor) {
            this.statusCode = valor;
            return this;
        },
        json(valor) {
            this.body = valor;
            return this;
        }
    };
    configuracao.handler(
        {
            method: 'POST',
            originalUrl: '/contact-invitations/token-secreto/respond',
            body: { acao: 'recusar' }
        },
        resposta
    );

    assert.equal(resposta.statusCode, 429);
    assert.equal(JSON.stringify(logs).includes('token-secreto'), false);
    assert.equal(JSON.stringify(logs).includes('recusar'), false);
});

test('rejeita configuração inválida', () => {
    assert.throws(() => criarContactInvitationResponseRateLimit(), TypeError);
});
