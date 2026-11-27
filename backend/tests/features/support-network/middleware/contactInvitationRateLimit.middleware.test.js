import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationRateLimit } from '../../../../src/features/support-network/middleware/contactInvitationRateLimit.middleware.js';

test('limita convites pela identidade autenticada', () => {
    let configuracao;
    const middleware = () => {};
    const resultado = criarContactInvitationRateLimit({
        rateLimit(valor) {
            configuracao = valor;
            return middleware;
        },
        janelaMs: 900000,
        limite: 3
    });

    assert.equal(resultado, middleware);
    assert.equal(configuracao.keyGenerator({ usuario: { id: 42 } }), 'usuario:42');
    assert.equal(configuracao.windowMs, 900000);
    assert.equal(configuracao.limit, 3);
});

test('responde 429 sem registrar e-mail, permissões ou corpo', () => {
    let configuracao;
    let log;
    const logger = {
        warn(valor) {
            log = valor;
        }
    };
    criarContactInvitationRateLimit({
        rateLimit(valor) {
            configuracao = valor;
            return () => {};
        },
        janelaMs: 900000,
        limite: 3,
        logger
    });
    const res = {
        codigo: null,
        corpo: null,
        status(valor) {
            this.codigo = valor;
            return this;
        },
        json(valor) {
            this.corpo = valor;
            return this;
        }
    };

    configuracao.handler(
        {
            usuario: { id: 42 },
            method: 'POST',
            originalUrl: '/support-network/contact-invitations',
            body: { email: 'privado@example.com' }
        },
        res
    );

    assert.equal(res.codigo, 429);
    assert.equal(res.corpo.erro.codigo, 'LIMITE_CONVITES_REDE_APOIO');
    assert.equal('body' in log, false);
    assert.equal(JSON.stringify(log).includes('privado@example.com'), false);
});

test('permite configurar um limite independente para consulta de contato', () => {
    let configuracao;
    let log;

    criarContactInvitationRateLimit({
        rateLimit(valor) {
            configuracao = valor;
            return () => {};
        },
        janelaMs: 900000,
        limite: 20,
        codigo: 'LIMITE_CONSULTAS_CONTATO',
        mensagem: 'Muitas consultas de contato. Aguarde alguns minutos e tente novamente.',
        evento: 'limite_consulta_contato_rede_apoio',
        logger: {
            warn(valor) {
                log = valor;
            }
        }
    });

    const res = {
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
            usuario: { id: 42 },
            method: 'POST',
            originalUrl: '/support-network/contact-invitations/lookup'
        },
        res
    );

    assert.equal(configuracao.limit, 20);
    assert.equal(res.statusCode, 429);
    assert.equal(res.body.erro.codigo, 'LIMITE_CONSULTAS_CONTATO');
    assert.equal(log.evento, 'limite_consulta_contato_rede_apoio');
});

test('rejeita configuração inválida', () => {
    assert.throws(() => criarContactInvitationRateLimit(), {
        name: 'TypeError',
        message: 'Não foi possível configurar o limite de convites.'
    });
});
