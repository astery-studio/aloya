import express from 'express';
const { Router } = express;

function criarAuthRoutes({
    authController,
    authMiddleware,
    cadastroRateLimit,
    emailRateLimit,
    loginRateLimit
}) {
    const router = Router();

    router.post(
        '/register',
        cadastroRateLimit,
        authController.cadastrar
    );

    router.post(
        '/login',
        loginRateLimit,
        authController.realizarLogin
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
        emailRateLimit,
        authController.solicitarConsentimento
    );

    // Reenvia o link para o e-mail já cadastrado.
    router.post(
        '/parental-consent/resend',
        authMiddleware.autenticar,
        emailRateLimit,
        authController.reenviarConsentimento
    );

    // Esta rota é pública porque será aberta pelo responsável legal pelo e-mail.
    router.get(
        '/parental-consent/:token',
        authController.confirmarConsentimento
    );

    return router;
}

export {
    criarAuthRoutes
};