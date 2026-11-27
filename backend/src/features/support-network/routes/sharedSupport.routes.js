import { AppError } from '../../../shared/errors/AppError.js';

function criarSharedSupportRoutes({
    Router,
    authMiddleware,
    parentalConsentMiddleware,
    sharedSupport
}) {
    const { access, data, diary } = sharedSupport;
    const router = Router();
    const base = '/received-contacts/:vinculoId/shared';

    function rota(caminho, buscar, permissao) {
        router.get(
            `${base}${caminho}`,
            authMiddleware.autenticar,
            parentalConsentMiddleware.exigirAcessoRedeApoio,
            async (req, res, next) => {
                res.set('Cache-Control', 'private, no-store');
                try {
                    const resultado = await access.consultarDados(
                        { contatoId: req.usuario.id, vinculoId: req.params.vinculoId, permissao },
                        (acesso) => buscar(acesso, req.query, req.params)
                    );
                    return res.json(resultado);
                } catch (erro) {
                    if (erro instanceof AppError && erro.status < 500) return next(erro);
                    return next(
                        new Error('Falha ao consultar os dados compartilhados.', { cause: erro })
                    );
                }
            }
        );
    }

    rota('', data.resumo);
    rota('/fase', data.fase, 'geral.fase_atual');
    rota('/dicas', data.dicas, 'geral.dicas');
    rota('/ciclos', data.historico, 'geral.historico_ciclo');
    rota('/calendario', data.calendario, 'geral.historico_ciclo');
    rota('/anticoncepcionais', data.anticoncepcionais, 'geral.anticoncepcionais');
    rota('/diario/catalogo', diary.catalogo);
    rota('/diario', diary.listar);
    rota('/diario/:registroId', (acesso, _query, { registroId }) =>
        diary.buscar(acesso, registroId)
    );

    return router;
}

export { criarSharedSupportRoutes };
