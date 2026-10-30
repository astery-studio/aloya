function criarCycleEditController({ service, validator } = {}) {
    if (!service || typeof service.buscar !== 'function' || typeof service.editar !== 'function') {
        throw new TypeError('O service da edição de ciclos é inválido.');
    }

    async function buscar(req, res, next) {
        try {
            const cicloId = validator.validarIdCiclo(req.params.id);
            const ciclo = await service.buscar({ usuarioId: req.usuario.id, cicloId });
            res.set('Cache-Control', 'no-store');
            return res.status(200).json({ ciclo });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao carregar este registro. Tente novamente.';
            }
            return next(erro);
        }
    }

    if (
        !validator ||
        typeof validator.validarIdCiclo !== 'function' ||
        typeof validator.validarCorpo !== 'function'
    ) {
        throw new TypeError('O validator da edição de ciclos é inválido.');
    }

    async function editar(req, res, next) {
        try {
            const cicloId = validator.validarIdCiclo(req.params.id);
            const dados = validator.validarCorpo(req.body);
            const ciclo = await service.editar({
                usuarioId: req.usuario.id,
                cicloId,
                dados
            });

            res.set('Cache-Control', 'no-store');

            return res.status(200).json({
                mensagem: 'Registro de menstruação atualizado com sucesso.',
                ciclo
            });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao atualizar este registro. Tente novamente.';
            }

            return next(erro);
        }
    }

    return { buscar, editar };
}

export { criarCycleEditController };
