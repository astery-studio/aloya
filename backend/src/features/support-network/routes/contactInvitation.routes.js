function criarContactInvitationRoutes({
    Router,
    authMiddleware,
    parentalConsentMiddleware,
    rateLimit,
    controller
} = {}) {
    if (
        typeof Router !== 'function' ||
        typeof authMiddleware?.autenticar !== 'function' ||
        typeof parentalConsentMiddleware?.exigirAcessoRedeApoio !== 'function' ||
        typeof rateLimit !== 'function' ||
        typeof controller?.consultarEmail !== 'function' ||
        typeof controller?.criarConvite !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar as rotas de convites.');
    }

    const router = Router();
    router.use(authMiddleware.autenticar);
    router.use(parentalConsentMiddleware.exigirAcessoRedeApoio);
    router.post('/contact-invitations/lookup', rateLimit, controller.consultarEmail);
    router.post('/contact-invitations', rateLimit, controller.criarConvite);
    return router;
}

export { criarContactInvitationRoutes };
