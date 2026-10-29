function criarCycleParametersController({ service, validator } = {}) {
    async function buscar(req, res, next) {
        try {
            const parametros = await service.buscar(req.usuario.id);
            return res.status(200).json({ parametros });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario = 'Não foi possível carregar os parâmetros do ciclo.';
            }
            return next(erro);
        }
    }

    async function atualizar(req, res, next) {
        try {
            const validacao = validator.validar(req.body);

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: 'Existem parâmetros do ciclo inválidos.',
                        detalhes: validacao.erros
                    }
                });
            }

            const parametros = await service.atualizar(req.usuario.id, validacao.dados);

            return res.status(200).json({
                mensagem: 'Parâmetros atualizados com sucesso.',
                parametros
            });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario = 'Não foi possível atualizar os parâmetros do ciclo.';
            }
            return next(erro);
        }
    }

    return { buscar, atualizar };
}

export { criarCycleParametersController };
