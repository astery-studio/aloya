import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationRoutes } from '../../../../src/features/support-network/routes/contactInvitation.routes.js';

function criarCenario() {
    const registros = [];
    const autenticar = () => {};
    const exigirAcessoRedeApoio = () => {};
    const rateLimit = () => {};
    const consultarEmail = () => {};
    const criarConvite = () => {};
    const router = {
        use(...handlers) {
            registros.push(['use', null, handlers]);
        },
        post(path, ...handlers) {
            registros.push(['post', path, handlers]);
        }
    };

    const resultado = criarContactInvitationRoutes({
        Router: () => router,
        authMiddleware: { autenticar },
        parentalConsentMiddleware: { exigirAcessoRedeApoio },
        rateLimit,
        controller: { consultarEmail, criarConvite }
    });

    return {
        registros,
        resultado,
        handlers: { autenticar, exigirAcessoRedeApoio, rateLimit, consultarEmail, criarConvite }
    };
}

test('protege consulta e criação antes de executar os controllers', () => {
    const { registros, handlers } = criarCenario();

    assert.deepEqual(registros, [
        ['use', null, [handlers.autenticar]],
        ['use', null, [handlers.exigirAcessoRedeApoio]],
        ['post', '/contact-invitations/lookup', [handlers.rateLimit, handlers.consultarEmail]],
        ['post', '/contact-invitations', [handlers.rateLimit, handlers.criarConvite]]
    ]);
});

test('devolve o roteador configurado', () => {
    const { resultado } = criarCenario();
    assert.equal(typeof resultado.post, 'function');
});

test('rejeita dependências incompletas', () => {
    assert.throws(() => criarContactInvitationRoutes(), {
        name: 'TypeError',
        message: 'Não foi possível configurar as rotas de convites.'
    });
});
