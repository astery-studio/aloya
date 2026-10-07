//Registra a consulta mensal do calendário exclusivamente para pessoas autenticadas.
function validarDependencias(dependencias) {
    const ehObjeto = dependencias !== null
        && typeof dependencias === 'object'
        && !Array.isArray(dependencias);

    if (!ehObjeto) {
        throw new TypeError('Não foi possível configurar as rotas do calendário.');
    }

    const {
        Router,
        authMiddleware,
        calendarController
    } = dependencias;
    const possuiRouter = typeof Router === 'function';
    const possuiAutenticacao = typeof authMiddleware?.autenticar === 'function';
    const possuiController = typeof calendarController?.buscarMes === 'function';

    if (!possuiRouter || !possuiAutenticacao || !possuiController) {
        throw new TypeError('Não foi possível configurar as rotas do calendário.');
    }
}

function criarCalendarRoutes(dependencias) {
    validarDependencias(dependencias);

    const {
        Router,
        authMiddleware,
        calendarController
    } = dependencias;
    const router = Router();

    router.use(authMiddleware.autenticar);
    router.get('/calendar', calendarController.buscarMes);

    return router;
}

export { criarCalendarRoutes };