function criarCycleRegistrationController({ service, sharingService }) {
    if (typeof service?.registrar !== 'function' || typeof sharingService?.buscar !== 'function')
        throw new TypeError('Controller de registro menstrual inválido.');
    async function registrar(req, res, next) {
        try {
            const resultado = await service.registrar({
                usuarioId: req.usuario.id,
                corpo: req.body,
                chave: req.get('Idempotency-Key')
            });
            res.set('Cache-Control', 'private, no-store');
            return res.status(resultado.repetida ? 200 : 201).json(resultado);
        } catch (erro) {
            if (!erro.status)
                erro.mensagemUsuario =
                    'Não foi possível registrar a menstruação. Tente sincronizar novamente.';
            return next(erro);
        }
    }
    async function compartilhar(req, res, next) {
        try {
            const resultado = await sharingService.buscar({
                contatoId: req.usuario.id,
                titularId: req.params.titularId,
                antesDe: req.query.antesDe
            });
            res.set('Cache-Control', 'private, no-store');
            return res.json(resultado);
        } catch (erro) {
            if (!erro.status)
                erro.mensagemUsuario = 'Não foi possível consultar o compartilhamento.';
            return next(erro);
        }
    }
    return { registrar, compartilhar };
}

export { criarCycleRegistrationController };
