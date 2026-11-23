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
        },
        patch(...args) {
            chamadas.push(['patch', ...args]);
        }
    };
    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function rateLimit() {}
    function remover() {}
    function desativar() {}

    const resultado = criarSupportContactRemovalRoutes({
        Router: () => router,
        authMiddleware: { autenticar },
        parentalConsentMiddleware: { exigirAcessoRedeApoio },
        rateLimit,
        controller: { desativar, remover }
    });

    assert.equal(resultado, router);
    assert.deepEqual(chamadas, [
        ['delete', '/contacts/:contatoId', autenticar, exigirAcessoRedeApoio, rateLimit, remover],
        [
            'patch',
            '/contacts/:contatoId/deactivate',
            autenticar,
            exigirAcessoRedeApoio,
            rateLimit,
            desativar
        ]
    ]);
});

test('rejeita configuração incompleta', () => {
    const completas = {
        Router() {},
        authMiddleware: { autenticar() {} },
        parentalConsentMiddleware: { exigirAcessoRedeApoio() {} },
        rateLimit() {},
        controller: { desativar() {}, remover() {} }
    };

    for (const chave of Object.keys(completas)) {
        assert.throws(
            () => criarSupportContactRemovalRoutes({ ...completas, [chave]: undefined }),
            /configurar as rotas de remoção de contato/
        );
    }
});
