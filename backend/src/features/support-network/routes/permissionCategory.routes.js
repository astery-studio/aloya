//Define as rotas protegidas usadas para gerenciar categorias de permissão.
function criarPermissionCategoryRoutes({Router, authMiddleware, parentalConsentMiddleware, permissionCategoryRateLimit, permissionCategoryController}) {
    const router = Router()

    router.use(authMiddleware.autenticar)
    router.use(parentalConsentMiddleware.exigirAcessoRedeApoio)
    router.post('/permission-categories', permissionCategoryRateLimit, permissionCategoryController.criarCategoria)

    return router
}

export { criarPermissionCategoryRoutes }