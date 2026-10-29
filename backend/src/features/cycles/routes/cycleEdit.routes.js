function criarCycleEditRoutes({ Router, authMiddleware, controller } = {}) {
    if (typeof Router !== 'function') {
        throw new TypeError('O Router da edição de ciclos é inválido.');
    }

    if (!authMiddleware || typeof authMiddleware.autenticar !== 'function') {
        throw new TypeError('O middleware de autenticação da edição de ciclos é inválido.');
    }

    if (
        !controller ||
        typeof controller.buscar !== 'function' ||
        typeof controller.editar !== 'function'
    ) {
        throw new TypeError('O controller da edição de ciclos é inválido.');
    }

    const router = Router();
    router.use(authMiddleware.autenticar);
    router.get('/:id', controller.buscar);
    router.patch('/:id', controller.editar);
    return router;
}

export { criarCycleEditRoutes };
