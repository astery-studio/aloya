function criarSupportContactRemovalRoutes({
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
        typeof controller?.remover !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar as rotas de remoção de contato.');
    }

    const router = Router();
    router.use(authMiddleware.autenticar);
    router.use(parentalConsentMiddleware.exigirAcessoRedeApoio);
    router.delete('/contacts/:contatoId', rateLimit, controller.remover);
    return router;
}

export { criarSupportContactRemovalRoutes };
