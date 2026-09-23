/**
 * Testes das rotas, proteções e limitadores do domínio de autenticação.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarAuthRoutes
} from '../src/routes/auth.routes.js';

function criarDependencias() {
    function cadastrar() {}
    function realizarLogin() {}
    function verificarEmail() {}
    function consultarStatusConsentimento() {}
    function solicitarConsentimento() {}
    function reenviarConsentimento() {}
    function confirmarConsentimento() {}
    function autenticar() {}
    function cadastroRateLimit() {}
    function emailRateLimit() {}
    function loginRateLimit() {}
    function solicitarRecuperacao() {}
    function validarTokenRecuperacao() {}
    function redefinirSenha() {}

    return {
        authController: {
            cadastrar,
            realizarLogin,
            verificarEmail,
            consultarStatusConsentimento,
            solicitarConsentimento,
            reenviarConsentimento,
            confirmarConsentimento
        },
        authMiddleware: {
            autenticar
        },
        cadastroRateLimit,
        emailRateLimit,
        loginRateLimit,
        passwordRecoveryController: {
            solicitar: solicitarRecuperacao,
            validarToken: validarTokenRecuperacao,
            redefinir: redefinirSenha
        }
    };
}

function buscarRota(router, caminho) {
    return router.stack.find(
        (camada) =>
            camada.route &&
            camada.route.path === caminho
    ).route;
}

test('protege a rota de cadastro com rate limit', () => {
    const dependencias = criarDependencias();
    const router = criarAuthRoutes(dependencias);
    const rota = buscarRota(router, '/register');

    assert.equal(rota.methods.post, true);
    assert.deepEqual(
        rota.stack.map((camada) => camada.handle),
        [
            dependencias.cadastroRateLimit,
            dependencias.authController.cadastrar
        ]
    );
});

test('protege a rota de login com rate limit', () => {
    const dependencias = criarDependencias();
    const router = criarAuthRoutes(dependencias);
    const rota = buscarRota(router, '/login');

    assert.equal(rota.methods.post, true);
    assert.deepEqual(
        rota.stack.map((camada) => camada.handle),
        [
            dependencias.loginRateLimit,
            dependencias.authController.realizarLogin
        ]
    );
});

test('exige autenticação para consultar o consentimento', () => {
    const dependencias = criarDependencias();
    const router = criarAuthRoutes(dependencias);
    const rota = buscarRota(
        router,
        '/parental-consent/status'
    );

    assert.equal(rota.methods.get, true);
    assert.deepEqual(
        rota.stack.map((camada) => camada.handle),
        [
            dependencias.authMiddleware.autenticar,
            dependencias.authController
                .consultarStatusConsentimento
        ]
    );
});

test('protege solicitação de consentimento e limita e-mails', () => {
    const dependencias = criarDependencias();
    const router = criarAuthRoutes(dependencias);
    const rota = buscarRota(
        router,
        '/parental-consent/request'
    );

    assert.equal(rota.methods.post, true);
    assert.deepEqual(
        rota.stack.map((camada) => camada.handle),
        [
            dependencias.authMiddleware.autenticar,
            dependencias.emailRateLimit,
            dependencias.authController
                .solicitarConsentimento
        ]
    );
});

test('protege reenvio de consentimento e limita e-mails', () => {
    const dependencias = criarDependencias();
    const router = criarAuthRoutes(dependencias);
    const rota = buscarRota(
        router,
        '/parental-consent/resend'
    );

    assert.equal(rota.methods.post, true);
    assert.deepEqual(
        rota.stack.map((camada) => camada.handle),
        [
            dependencias.authMiddleware.autenticar,
            dependencias.emailRateLimit,
            dependencias.authController
                .reenviarConsentimento
        ]
    );
});

test('mantém pública somente a confirmação por token', () => {
    const dependencias = criarDependencias();
    const router = criarAuthRoutes(dependencias);
    const rota = buscarRota(
        router,
        '/parental-consent/:token'
    );

    assert.equal(rota.methods.get, true);
    assert.deepEqual(
        rota.stack.map((camada) => camada.handle),
        [
            dependencias.authController
                .confirmarConsentimento
        ]
    );

    assert.equal(
        rota.stack.some(
            (camada) =>
                camada.handle ===
                dependencias.authMiddleware.autenticar
        ),
        false
    );
});

test('protege a verificação de e-mail com rate limit', () => {
    const dependencias = criarDependencias();
    const router = criarAuthRoutes(dependencias);
    const rota = buscarRota(router, '/email-availability');

    assert.equal(rota.methods.post, true);
    assert.deepEqual(
        rota.stack.map((camada) => camada.handle),
        [
            dependencias.cadastroRateLimit,
            dependencias.authController.verificarEmail
        ]
    );
});

test('limita solicitações de recuperação por e-mail', () => {
    const dependencias = criarDependencias();
    const rota = buscarRota(
        criarAuthRoutes(dependencias),
        '/password-recovery/request'
    );

    assert.deepEqual(
        rota.stack.map((camada) => camada.handle),
        [
            dependencias.emailRateLimit,
            dependencias.passwordRecoveryController.solicitar
        ]
    );
});

test('expõe validação e redefinição da senha', () => {
    const dependencias = criarDependencias();
    const router = criarAuthRoutes(dependencias);
    const validar = buscarRota(router, '/password-recovery/:token');
    const redefinir = buscarRota(router, '/password-recovery/reset');

    assert.equal(validar.methods.get, true);
    assert.equal(redefinir.methods.post, true);
    assert.deepEqual(
        redefinir.stack.map((camada) => camada.handle),
        [
            dependencias.emailRateLimit,
            dependencias.passwordRecoveryController.redefinir
        ]
    );
});
