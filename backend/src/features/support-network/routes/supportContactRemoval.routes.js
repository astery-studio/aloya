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
        typeof controller?.desativar !== 'function' ||
        typeof controller?.remover !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar as rotas de remoção de contato.');
    }

    const router = Router();
    router.delete(
        '/contacts/:contatoId',
        authMiddleware.autenticar,
        parentalConsentMiddleware.exigirAcessoRedeApoio,
        rateLimit,
        controller.remover
    );
    router.patch(
        '/contacts/:contatoId/deactivate',
        authMiddleware.autenticar,
        parentalConsentMiddleware.exigirAcessoRedeApoio,
        rateLimit,
        controller.desativar
    );
    return router;
}

export { criarSupportContactRemovalRoutes };
