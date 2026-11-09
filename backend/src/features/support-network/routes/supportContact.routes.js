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
    router.use(authMiddleware.autenticar);
    router.get('/received-contacts', controller.listarRecebidos);
    router.post(
        '/received-contacts/:conviteId/respond',
        responseRateLimit,
        controller.responderRecebido
    );
    router.use(parentalConsentMiddleware.exigirAcessoRedeApoio);
    router.get('/contacts', controller.listar);
    router.post('/contacts/:contatoId/resend-invitation', rateLimit, controller.reenviarConvite);
    return router;
}

export { criarSupportContactRoutes };
