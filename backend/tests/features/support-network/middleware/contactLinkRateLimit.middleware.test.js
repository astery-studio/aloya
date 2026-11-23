import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactLinkRateLimit } from '../../../../src/features/support-network/middleware/contactLinkRateLimit.middleware.js';

test('limita alterações pela identidade autenticada sem usar dados do corpo', () => {
    let opcoes;
    const middleware = () => {};
    const resultado = criarContactLinkRateLimit({
        rateLimit(configuracao) {
            opcoes = configuracao;
            return middleware;
        },
        janelaMs: 60000,
        limite: 5,
        logger: { warn() {} }
    });

    assert.equal(resultado, middleware);
    assert.equal(opcoes.keyGenerator({ usuario: { id: 42 } }), 'usuario:42');
    assert.equal(opcoes.windowMs, 60000);
    assert.equal(opcoes.limit, 5);
    assert.equal(opcoes.standardHeaders, true);
    assert.equal(opcoes.legacyHeaders, false);
});

test('responde 429 e registra somente metadados não sensíveis', () => {
    let opcoes;
    const logs = [];
    criarContactLinkRateLimit({
        rateLimit(configuracao) {
            opcoes = configuracao;
            return () => {};
        },
        janelaMs: 60000,
        limite: 5,
        logger: {
            warn(dados) {
                logs.push(dados);
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
    const req = {
        usuario: { id: 42 },
        method: 'PATCH',
        originalUrl: '/support-network/contacts/9/link',
        body: { permissoesIndividuais: ['saude.consultas'] }
    };

    opcoes.handler(req, res);

    assert.equal(estado.status, 429);
    assert.equal(estado.body.erro.codigo, 'LIMITE_ATUALIZACAO_VINCULO');
    assert.deepEqual(logs, [
        {
            evento: 'limite_alteracao_vinculo_rede_apoio',
            usuarioId: 42,
            metodo: 'PATCH',
            rota: '/support-network/contacts/9/link'
        }
    ]);
    assert.equal(JSON.stringify(logs).includes('saude.consultas'), false);
});

test('rejeita configuração inválida', () => {
    assert.throws(() => criarContactLinkRateLimit(), /configurar o limite/);
});
