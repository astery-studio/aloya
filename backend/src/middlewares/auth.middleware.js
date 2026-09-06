function criarAuthMiddleware({ tokenService }) {
    // Middleware que identifica o titular autenticado pelo JWT
    function autenticar(req, res, next) {
        const cabecalhoAutorizacao =
            req.headers.authorization;

        if (
            !cabecalhoAutorizacao ||
            !cabecalhoAutorizacao.startsWith('Bearer ')
        ) {
            return res.status(401).json({
                erro: {
                    codigo: 'NAO_AUTENTICADO',
                    mensagem: 'Token de autenticação não informado.'
                }
            });
        }

        const token = cabecalhoAutorizacao.slice(7);

        try {
            const payload =
                tokenService.validarTokenSessao(token);

            // Disponibiliza somente os dados necessários para a rota protegida
            req.usuario = {
                id: Number(payload.sub),
                papel: payload.papel
            };

            return next();
        } catch (_erro) {
            return res.status(401).json({
                erro: {
                    codigo: 'TOKEN_INVALIDO',
                    mensagem: 'Token de autenticação inválido ou expirado.'
                }
            });
        }
    }

    return {
        autenticar
    };
}

module.exports = {
    criarAuthMiddleware
};