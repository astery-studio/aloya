function criarContactInvitationRoutes({
    Router,
    authMiddleware,
    parentalConsentMiddleware,
    lookupRateLimit,
    rateLimit,
    responseRateLimit,
    controller,
    responseController
} = {}) {
    if (
        typeof Router !== 'function' ||
        typeof authMiddleware?.autenticar !== 'function' ||
        typeof parentalConsentMiddleware?.exigirAcessoRedeApoio !== 'function' ||
        typeof lookupRateLimit !== 'function' ||
        typeof rateLimit !== 'function' ||
        typeof responseRateLimit !== 'function' ||
        typeof controller?.consultarEmail !== 'function' ||
        typeof controller?.criarConvite !== 'function' ||
        typeof responseController?.consultar !== 'function' ||
        typeof responseController?.cadastrarContato !== 'function' ||
        typeof responseController?.responder !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar as rotas de convites.');
    }

    const router = Router();
    router.get('/contact-invitations/:token', responseRateLimit, responseController.consultar);
    router.post(
        '/contact-invitations/:token/register',
        responseRateLimit,
        responseController.cadastrarContato
    );
    router.use(authMiddleware.autenticar);
    router.post(
        '/contact-invitations/:token/respond',
        responseRateLimit,
        responseController.responder
    );
    router.use(parentalConsentMiddleware.exigirAcessoRedeApoio);
    router.post('/contact-invitations/lookup', lookupRateLimit, controller.consultarEmail);
    router.post('/contact-invitations', rateLimit, controller.criarConvite);
    return router;
}

export { criarContactInvitationRoutes };
