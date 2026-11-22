//Define as rotas protegidas usadas para gerenciar categorias de permissão.
function criarPermissionCategoryRoutes({
    Router,
    authMiddleware,
    parentalConsentMiddleware,
    permissionCategoryRateLimit,
    permissionCategoryUpdateRateLimit = permissionCategoryRateLimit,
    permissionCategoryDeletionRateLimit = permissionCategoryUpdateRateLimit,
    permissionCategoryController,
    permissionCategoryDeletionController
}) {
    const router = Router();
    const autenticar = authMiddleware.autenticar;
    const exigirAcesso = parentalConsentMiddleware.exigirAcessoRedeApoio;

    router.get(
        '/permission-categories',
        autenticar,
        exigirAcesso,
        permissionCategoryController.listarCategorias
    );
    router.post(
        '/permission-categories',
        autenticar,
        exigirAcesso,
        permissionCategoryRateLimit,
        permissionCategoryController.criarCategoria
    );
    router.put(
        '/permission-categories/:id',
        autenticar,
        exigirAcesso,
        permissionCategoryUpdateRateLimit,
        permissionCategoryController.editarCategoria
    );

    if (permissionCategoryDeletionController) {
        router.get(
            '/permission-categories/:id/deletion-impact',
            autenticar,
            exigirAcesso,
            permissionCategoryDeletionController.consultarImpacto
        );
        router.delete(
            '/permission-categories/:id',
            autenticar,
            exigirAcesso,
            permissionCategoryDeletionRateLimit,
            permissionCategoryDeletionController.excluirCategoria
        );
    }

    return router;
}

export { criarPermissionCategoryRoutes };
