function criarCycleRegistrationRoutes({ Router, authMiddleware, controller }) {
    if (
        typeof Router !== 'function' ||
        typeof authMiddleware?.autenticar !== 'function' ||
        typeof controller?.registrar !== 'function' ||
        typeof controller?.compartilhar !== 'function'
    )
        throw new TypeError('Rotas de registro menstrual inválidas.');
    const router = Router();
    router.use(authMiddleware.autenticar);
    router.get('/shared/:titularId', controller.compartilhar);
    router.post('/registrations', controller.registrar);
    return router;
}

export { criarCycleRegistrationRoutes };
