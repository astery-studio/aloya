const { Router } = require('express');

function criarAuthRoutes({
    authController,
    authMiddleware
}) {
    const router = Router();

    router.post(
        '/register',
        authController.cadastrar
    );

    // Retorna o estado atual da liberação da Rede de Apoio.
    router.get(
        '/parental-consent/status',
        authMiddleware.autenticar,
        authController.consultarStatusConsentimento
    );

    // Permite informar ou substituir o e-mail do responsável legal.
    router.post(
        '/parental-consent/request',
        authMiddleware.autenticar,
        authController.solicitarConsentimento
    );

    // Reenvia o link para o e-mail já cadastrado.
    router.post(
        '/parental-consent/resend',
        authMiddleware.autenticar,
        authController.reenviarConsentimento
    );

    // Esta rota é pública porque será aberta pelo responsável legal pelo e-mail.
    router.get(
        '/parental-consent/:token',
        authController.confirmarConsentimento
    );

    return router;
}

module.exports = {
    criarAuthRoutes
};