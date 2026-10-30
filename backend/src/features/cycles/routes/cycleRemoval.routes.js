function validarDependencias({ Router, authMiddleware, cycleRemovalController } = {}) {
    if (typeof Router !== 'function') {
        throw new TypeError('O Router de remoção de ciclos é inválido.');
    }

    if (typeof authMiddleware?.autenticar !== 'function') {
        throw new TypeError('O middleware de autenticação do histórico é inválido.');
    }

    if (
        typeof cycleRemovalController?.removerDia !== 'function' ||
        typeof cycleRemovalController?.excluirCiclo !== 'function'
    ) {
        throw new TypeError('O controller de remoção de ciclos é inválido.');
    }
}

function criarCycleRemovalRoutes(dependencias = {}) {
    validarDependencias(dependencias);
    const { Router, authMiddleware, cycleRemovalController } = dependencias;
    const router = Router();

    router.use(authMiddleware.autenticar);
    router.delete('/history/:cicloId/days/:data', cycleRemovalController.removerDia);
    router.delete('/history/:cicloId', cycleRemovalController.excluirCiclo);

    return router;
}

export { criarCycleRemovalRoutes };
