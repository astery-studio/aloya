import assert from 'node:assert/strict';
import test from 'node:test';

import { criarSupportContactRoutes } from '../../../../src/features/support-network/routes/supportContact.routes.js';

function criarRouter() {
    const chamadas = [];
    const router = {
        use(...args) {
            chamadas.push(['use', ...args]);
        },
        get(...args) {
            chamadas.push(['get', ...args]);
        },
        post(...args) {
            chamadas.push(['post', ...args]);
        }
    };
    return { chamadas, Router: () => router, router };
}

test('protege a listagem antes de executar o controller', () => {
    const { chamadas, Router, router } = criarRouter();
    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function rateLimit() {}
    function listar() {}
    function reenviarConvite() {}

    const resultado = criarSupportContactRoutes({
        Router,
        authMiddleware: { autenticar },
        parentalConsentMiddleware: { exigirAcessoRedeApoio },
        rateLimit,
        controller: { listar, reenviarConvite }
    });

    assert.equal(resultado, router);
    assert.deepEqual(chamadas, [
        ['use', autenticar],
        ['use', exigirAcessoRedeApoio],
        ['get', '/contacts', listar],
        ['post', '/contacts/:contatoId/resend-invitation', rateLimit, reenviarConvite]
    ]);
});

test('rejeita dependências incompletas sem criar rota parcialmente protegida', () => {
    const casos = [
        {},
        { Router() {} },
        { Router() {}, authMiddleware: { autenticar() {} } },
        {
            Router() {},
            authMiddleware: { autenticar() {} },
            parentalConsentMiddleware: { exigirAcessoRedeApoio() {} }
        },
        {
            Router() {},
            authMiddleware: { autenticar() {} },
            parentalConsentMiddleware: { exigirAcessoRedeApoio() {} },
            rateLimit() {},
            controller: { listar() {} }
        }
    ];

    for (const dependencias of casos) {
        assert.throws(
            () => criarSupportContactRoutes(dependencias),
            /configurar as rotas de contatos/
        );
    }
});
