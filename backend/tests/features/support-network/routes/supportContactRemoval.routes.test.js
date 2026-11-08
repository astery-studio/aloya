import assert from 'node:assert/strict';
import test from 'node:test';

import { criarSupportContactRemovalRoutes } from '../../../../src/features/support-network/routes/supportContactRemoval.routes.js';

test('protege a remoção antes de executar o controller', () => {
    const chamadas = [];
    const router = {
        use(...args) {
            chamadas.push(['use', ...args]);
        },
        delete(...args) {
            chamadas.push(['delete', ...args]);
        }
    };
    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function rateLimit() {}
    function remover() {}

    const resultado = criarSupportContactRemovalRoutes({
        Router: () => router,
        authMiddleware: { autenticar },
        parentalConsentMiddleware: { exigirAcessoRedeApoio },
        rateLimit,
        controller: { remover }
    });

    assert.equal(resultado, router);
    assert.deepEqual(chamadas, [
        ['use', autenticar],
        ['use', exigirAcessoRedeApoio],
        ['delete', '/contacts/:contatoId', rateLimit, remover]
    ]);
});

test('rejeita configuração incompleta', () => {
    const completas = {
        Router() {},
        authMiddleware: { autenticar() {} },
        parentalConsentMiddleware: { exigirAcessoRedeApoio() {} },
        rateLimit() {},
        controller: { remover() {} }
    };

    for (const chave of Object.keys(completas)) {
        assert.throws(
            () => criarSupportContactRemovalRoutes({ ...completas, [chave]: undefined }),
            /configurar as rotas de remoção de contato/
        );
    }
});
