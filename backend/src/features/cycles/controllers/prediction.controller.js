const MENSAGEM_ERRO = 'Não foi possível carregar sua previsão no momento. Tente novamente.';

function criarPredictionController({ predictionService }) {
    async function buscar(req, res, next) {
        try {
            const previsao = await predictionService.buscar(req.usuario.id);
            res.set('Cache-Control', 'private, no-store');
            return res.json({ previsao });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario = MENSAGEM_ERRO;
            }

            return next(erro);
        }
    }

    return { buscar };
}

export { criarPredictionController, MENSAGEM_ERRO };
