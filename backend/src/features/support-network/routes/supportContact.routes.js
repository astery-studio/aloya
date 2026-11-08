function criarSupportContactRoutes({
    Router,
    authMiddleware,
    parentalConsentMiddleware,
    controller
} = {}) {
    if (
        typeof Router !== 'function' ||
        typeof authMiddleware?.autenticar !== 'function' ||
        typeof parentalConsentMiddleware?.exigirAcessoRedeApoio !== 'function' ||
        typeof controller?.listar !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar as rotas de contatos.');
    }

    const router = Router();
    router.use(authMiddleware.autenticar);
    router.use(parentalConsentMiddleware.exigirAcessoRedeApoio);
    router.get('/contacts', controller.listar);
    return router;
}

export { criarSupportContactRoutes };
