function criarDiaryRoutes({
    Router,
    autenticar,
    catalogController,
    entryController,
    historyController,
    overviewController,
    mutationController,
    validarPreferencia,
    rateLimit,
    preferencesRateLimit = rateLimit
} = {}) {
    if (typeof Router !== 'function' || typeof autenticar !== 'function') {
        throw new TypeError('Não foi possível configurar as rotas do Diário.');
    }

    const router = Router();
    router.use(autenticar);
    router.use((_req, res, next) => {
        res.set('Cache-Control', 'private, no-store');
        next();
    });
    router.use((req, _res, next) => {
        req.validarPreferencia = validarPreferencia;
        next();
    });

    router.get('/catalogo', catalogController.buscar);
    router.get('/resumo', overviewController.buscar);
    router.get('/registros', historyController.listar);
    router.get('/registros/:id', historyController.buscar);
    router.post('/registros', rateLimit, entryController.criar);
    router.patch('/preferencias', preferencesRateLimit, catalogController.atualizarLote);
    router.put('/registros/:id', rateLimit, mutationController.editar);
    router.delete('/registros/:id', rateLimit, mutationController.excluir);
    router.patch(
        '/preferencias/macrocategorias/:id',
        preferencesRateLimit,
        catalogController.atualizarMacrocategoria
    );
    router.patch(
        '/preferencias/categorias/:id',
        preferencesRateLimit,
        catalogController.atualizarCategoria
    );

    return router;
}

export { criarDiaryRoutes };
