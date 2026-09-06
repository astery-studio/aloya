const { Router } = require('express');

function criarAuthRoutes({
    authController,
    authMiddleware
}) {
    const router = Router();

    // Rota pública para criação de conta
    router.post(
        '/register',
        authController.cadastrar
    );

    // Rota autenticada para informar o e-mail do responsável posteriormente
    router.post(
        '/parental-consent/request',
        authMiddleware.autenticar,
        authController.solicitarConsentimento
    );

    // Rota autenticada para gerar novo token e reenviar o e-mail
    router.post(
        '/parental-consent/resend',
        authMiddleware.autenticar,
        authController.reenviarConsentimento
    );

    // Rota pública porque o responsável legal não possui conta no sistema
    router.get(
        '/parental-consent/:token',
        authController.confirmarConsentimento
    );

    return router;
}

module.exports = {
    criarAuthRoutes
};