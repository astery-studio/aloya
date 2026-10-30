function criarCycleParametersRoutes({ Router, authMiddleware, controller, rateLimit } = {}) {
    const router = Router();

    router.use(authMiddleware.autenticar);
    router.get('/cycle-parameters', controller.buscar);
    router.patch('/cycle-parameters', rateLimit, controller.atualizar);

    return router;
}

export { criarCycleParametersRoutes };
