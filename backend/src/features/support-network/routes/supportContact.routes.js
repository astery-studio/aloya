function criarSupportContactRoutes({
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
        typeof controller?.listar !== 'function' ||
        typeof controller?.reenviarConvite !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar as rotas de contatos.');
    }

    const router = Router();
    router.use(authMiddleware.autenticar);
    router.use(parentalConsentMiddleware.exigirAcessoRedeApoio);
    router.get('/contacts', controller.listar);
    router.post('/contacts/:contatoId/resend-invitation', rateLimit, controller.reenviarConvite);
    return router;
}

export { criarSupportContactRoutes };
