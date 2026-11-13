function criarContactLinkRoutes({
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
        typeof controller?.consultar !== 'function' ||
        typeof controller?.atualizar !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar as rotas de vínculo.');
    }

    const router = Router();
    router.get(
        '/contacts/:contatoId/link',
        authMiddleware.autenticar,
        parentalConsentMiddleware.exigirAcessoRedeApoio,
        controller.consultar
    );
    router.patch(
        '/contacts/:contatoId/link',
        authMiddleware.autenticar,
        parentalConsentMiddleware.exigirAcessoRedeApoio,
        rateLimit,
        controller.atualizar
    );
    return router;
}

export { criarContactLinkRoutes };
