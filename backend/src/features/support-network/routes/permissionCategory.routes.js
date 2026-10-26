//Define as rotas protegidas usadas para gerenciar categorias de permissão.
function criarPermissionCategoryRoutes({
    Router,
    authMiddleware,
    parentalConsentMiddleware,
    permissionCategoryRateLimit,
    permissionCategoryUpdateRateLimit = permissionCategoryRateLimit,
    permissionCategoryController
}) {
    const router = Router();

    router.use(authMiddleware.autenticar);
    router.use(parentalConsentMiddleware.exigirAcessoRedeApoio);
    router.get('/permission-categories', permissionCategoryController.listarCategorias);
    router.post(
        '/permission-categories',
        permissionCategoryRateLimit,
        permissionCategoryController.criarCategoria
    );
    router.put(
        '/permission-categories/:id',
        permissionCategoryUpdateRateLimit,
        permissionCategoryController.editarCategoria
    );

    return router;
}

export { criarPermissionCategoryRoutes };
