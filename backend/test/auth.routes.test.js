const test = require('node:test');
const assert = require('node:assert/strict');

const {
    criarAuthRoutes
} = require('../src/routes/auth.routes');

function criarDependencias() {
    function cadastrar() {}
    function realizarLogin() {}
    function consultarStatusConsentimento() {}
    function solicitarConsentimento() {}
    function reenviarConsentimento() {}
    function confirmarConsentimento() {}
    function autenticar() {}
    function cadastroRateLimit() {}
    function emailRateLimit() {}
    function loginRateLimit() {}

    return {
        authController: {
            cadastrar,
            realizarLogin,
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
        loginRateLimit
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