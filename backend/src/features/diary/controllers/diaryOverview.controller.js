// Expõe o resumo personalizado da fase somente para a pessoa autenticada.
function criarDiaryOverviewController({ service, validarResumo } = {}) {
    if (!service?.buscar || typeof validarResumo !== 'function') {
        throw new TypeError('Não foi possível configurar o resumo do Diário.');
    }

    async function buscar(req, res, next) {
        try {
            const { fase } = validarResumo(req.query);
            const resumo = await service.buscar(req.usuario.id, fase);
            return res.status(200).json(resumo);
        } catch (erro) {
            return next(erro);
        }
    }

    return { buscar };
}

export { criarDiaryOverviewController };
