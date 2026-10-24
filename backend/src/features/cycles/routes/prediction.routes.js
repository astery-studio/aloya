function criarPredictionRoutes({ Router, autenticar, controller }) {
    const rotas = Router();
    rotas.use(autenticar);
    rotas.get('/prediction', controller.buscar);
    return rotas;
}

export { criarPredictionRoutes };
