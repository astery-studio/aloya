function criarDiaryEntryController({ service, validarCriacao } = {}) {
    if (!service?.criar || typeof validarCriacao !== 'function') {
        throw new TypeError('Não foi possível configurar a criação do Diário.');
    }

    async function criar(req, res, next) {
        try {
            const dados = validarCriacao(req.body);
            const registro = await service.criar(req.usuario.id, dados);
            res.set('ETag', `"${registro.versao}"`);
            return res.status(201).json(registro);
        } catch (erro) {
            return next(erro);
        }
    }

    return { criar };
}

export { criarDiaryEntryController };
