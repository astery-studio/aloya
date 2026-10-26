import test from 'node:test';
import assert from 'node:assert/strict';

import { criarPermissionCategoryDeletionRateLimit } from '../../../../src/features/support-network/middleware/permissionCategoryDeletionRateLimit.middleware.js';

test('limita exclusões por titular sem registrar decisões sensíveis', () => {
    let configuracao;
    const logs = [];
    const middleware = criarPermissionCategoryDeletionRateLimit({
        rateLimit(opcoes) {
            configuracao = opcoes;
            return opcoes;
        },
        janelaMs: 60_000,
        limite: 5,
        logger: {
            warn(evento) {
                logs.push(evento);
            }
        }
    });

    assert.equal(middleware, configuracao);
    assert.equal(configuracao.keyGenerator({ usuario: { id: 7 } }), 'usuario:7');

    const resposta = {
        statusCode: null,
        body: null,
        status(codigo) {
            this.statusCode = codigo;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
    const req = {
        usuario: { id: 7 },
        method: 'DELETE',
        originalUrl: '/support-network/permission-categories/12',
        body: {
            decisoes: [{ vinculoId: 20, acao: 'remover_acesso' }]
        }
    };

    configuracao.handler(req, resposta);

    assert.equal(resposta.statusCode, 429);
    assert.equal(resposta.body.erro.codigo, 'LIMITE_EXCLUSAO_CATEGORIA');
    assert.equal(JSON.stringify(logs).includes('remover_acesso'), false);
    assert.equal(JSON.stringify(logs).includes('vinculoId'), false);
});
