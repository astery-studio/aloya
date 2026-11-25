function responderComPreferencias(operacao) {
    return async (req, res, next) => {
        try {
            const preferencias = await operacao(req.usuario.id, req.body);
            return res.set('Cache-Control', 'no-store').json({ preferencias });
        } catch (erro) {
            return next(erro);
        }
    };
}

export function criarNotificationPreferencesRoutes({ Router, autenticar, rateLimit, service }) {
    const rotas = Router();
    rotas.get('/', autenticar, responderComPreferencias(service.buscar));
    rotas.patch('/', autenticar, rateLimit, responderComPreferencias(service.atualizar));
    return rotas;
}
