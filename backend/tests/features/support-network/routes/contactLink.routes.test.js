import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactLinkRoutes } from '../../../../src/features/support-network/routes/contactLink.routes.js';

test('protege consulta e atualização antes dos controllers', () => {
    const chamadas = [];
    const router = {
        use(...args) {
            chamadas.push(['use', ...args]);
        },
        get(...args) {
            chamadas.push(['get', ...args]);
        },
        patch(...args) {
            chamadas.push(['patch', ...args]);
        }
    };
    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function rateLimit() {}
    function consultar() {}
    function atualizar() {}

    const resultado = criarContactLinkRoutes({
        Router: () => router,
        authMiddleware: { autenticar },
        parentalConsentMiddleware: { exigirAcessoRedeApoio },
        rateLimit,
        controller: { consultar, atualizar }
    });

    assert.equal(resultado, router);
    assert.deepEqual(chamadas, [
        ['use', autenticar],
        ['use', exigirAcessoRedeApoio],
        ['get', '/contacts/:contatoId/link', consultar],
        ['patch', '/contacts/:contatoId/link', rateLimit, atualizar]
    ]);
});

test('rejeita configuração incompleta', () => {
    const completas = {
        Router() {},
        authMiddleware: { autenticar() {} },
        parentalConsentMiddleware: { exigirAcessoRedeApoio() {} },
        rateLimit() {},
        controller: { consultar() {}, atualizar() {} }
    };

    for (const chave of Object.keys(completas)) {
        assert.throws(
            () => criarContactLinkRoutes({ ...completas, [chave]: undefined }),
            /configurar as rotas de vínculo/
        );
    }
});
