//Define a rota autenticada responsável pela leitura paginada do histórico de ciclos.

//Confere se todas as dependências da rota foram configuradas corretamente.
function validarDependencias({Router, authMiddleware, cycleHistoryController} = {}) {
    if (typeof Router !== 'function') {
        throw new TypeError('O Router do histórico de ciclos é inválido.');
    }

    if (!authMiddleware || typeof authMiddleware.autenticar !== 'function') {
        throw new TypeError('O middleware de autenticação do histórico é inválido.');
    }

    if (!cycleHistoryController || typeof cycleHistoryController.listarHistorico !== 'function') {
        throw new TypeError('O controller do histórico de ciclos é inválido.');
    }
}

//Cria a rota protegida que disponibiliza o histórico da própria pessoa autenticada.
function criarCycleHistoryRoutes(dependencias = {}) {
    validarDependencias(dependencias);

    const {Router, authMiddleware, cycleHistoryController} = dependencias;
    const router = Router();

    router.use(authMiddleware.autenticar);
    router.get('/history', cycleHistoryController.listarHistorico);

    return router;
}

export {criarCycleHistoryRoutes};