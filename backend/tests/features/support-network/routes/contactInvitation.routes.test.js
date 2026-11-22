import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationRoutes } from '../../../../src/features/support-network/routes/contactInvitation.routes.js';

function criarCenario() {
    const registros = [];
    const autenticar = () => {};
    const exigirAcessoRedeApoio = () => {};
    const lookupRateLimit = () => {};
    const rateLimit = () => {};
    const responseRateLimit = () => {};
    const consultarEmail = () => {};
    const criarConvite = () => {};
    const consultar = () => {};
    const cadastrarContato = () => {};
    const responder = () => {};
    const router = {
        use(...handlers) {
            registros.push(['use', null, handlers]);
        },
        post(path, ...handlers) {
            registros.push(['post', path, handlers]);
        },
        get(path, ...handlers) {
            registros.push(['get', path, handlers]);
        }
    };

    const resultado = criarContactInvitationRoutes({
        Router: () => router,
        authMiddleware: { autenticar },
        parentalConsentMiddleware: { exigirAcessoRedeApoio },
        lookupRateLimit,
        rateLimit,
        responseRateLimit,
        controller: { consultarEmail, criarConvite },
        responseController: { consultar, cadastrarContato, responder }
    });

    return {
        registros,
        resultado,
        handlers: {
            autenticar,
            exigirAcessoRedeApoio,
            lookupRateLimit,
            rateLimit,
            responseRateLimit,
            consultarEmail,
            criarConvite,
            consultar,
            cadastrarContato,
            responder
        }
    };
}

test('protege consulta e criação antes de executar os controllers', () => {
    const { registros, handlers } = criarCenario();

    assert.deepEqual(registros, [
        ['get', '/contact-invitations/:token', [handlers.responseRateLimit, handlers.consultar]],
        [
            'post',
            '/contact-invitations/:token/register',
            [handlers.responseRateLimit, handlers.cadastrarContato]
        ],
        [
            'post',
            '/contact-invitations/:token/respond',
            [handlers.autenticar, handlers.responseRateLimit, handlers.responder]
        ],
        [
            'post',
            '/contact-invitations/lookup',
            [
                handlers.autenticar,
                handlers.exigirAcessoRedeApoio,
                handlers.lookupRateLimit,
                handlers.consultarEmail
            ]
        ],
        [
            'post',
            '/contact-invitations',
            [
                handlers.autenticar,
                handlers.exigirAcessoRedeApoio,
                handlers.rateLimit,
                handlers.criarConvite
            ]
        ]
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
