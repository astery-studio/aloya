function criarSupportContactRoutes({
    Router,
    authMiddleware,
    parentalConsentMiddleware,
    rateLimit,
    responseRateLimit,
    controller
} = {}) {
    if (
        typeof Router !== 'function' ||
        typeof authMiddleware?.autenticar !== 'function' ||
        typeof parentalConsentMiddleware?.exigirAcessoRedeApoio !== 'function' ||
        typeof rateLimit !== 'function' ||
        typeof responseRateLimit !== 'function' ||
        typeof controller?.listar !== 'function' ||
        typeof controller?.listarRecebidos !== 'function' ||
        typeof controller?.responderRecebido !== 'function' ||
        typeof controller?.reenviarConvite !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar as rotas de contatos.');
    }

    const router = Router();
    router.get(
        '/received-contacts',
        authMiddleware.autenticar,
        parentalConsentMiddleware.exigirAcessoRedeApoio,
        controller.listarRecebidos
    );
    router.post(
        '/received-contacts/:conviteId/respond',
        authMiddleware.autenticar,
        parentalConsentMiddleware.exigirAcessoRedeApoio,
        responseRateLimit,
        controller.responderRecebido
    );
    router.get(
        '/contacts',
        authMiddleware.autenticar,
        parentalConsentMiddleware.exigirAcessoRedeApoio,
        controller.listar
    );
    router.post(
        '/contacts/:contatoId/resend-invitation',
        authMiddleware.autenticar,
        parentalConsentMiddleware.exigirAcessoRedeApoio,
        rateLimit,
        controller.reenviarConvite
    );
    return router;
}

export { criarSupportContactRoutes };
