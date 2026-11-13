function criarContactInvitationController({ service, validator } = {}) {
    if (
        typeof service?.consultarEmail !== 'function' ||
        typeof service?.criarConvite !== 'function' ||
        typeof validator?.validarConsultaEmail !== 'function' ||
        typeof validator?.validarCriacaoConvite !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar o controller de convites.');
    }

    function responderValidacao(res, validacao) {
        return res.status(422).json({
            erro: {
                codigo: 'ERRO_VALIDACAO',
                mensagem: validacao.erros[0].mensagem,
                detalhes: validacao.erros
            }
        });
    }

    async function consultarEmail(req, res, next) {
        try {
            const validacao = validator.validarConsultaEmail(req.body);
            if (!validacao.valido) return responderValidacao(res, validacao);

            const resultado = await service.consultarEmail({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                email: validacao.dados.email
            });

            res.set('Cache-Control', 'private, no-store');
            return res.status(200).json(resultado);
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Não foi possível verificar este e-mail no momento. Tente novamente.';
            }
            return next(erro);
        }
    }

    async function criarConvite(req, res, next) {
        try {
            const validacao = validator.validarCriacaoConvite(req.body);
            if (!validacao.valido) return responderValidacao(res, validacao);

            const convite = await service.criarConvite({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                ...validacao.dados
            });

            res.set('Cache-Control', 'no-store');
            return res.status(201).json({
                mensagem: 'Convite enviado com sucesso.',
                convite
            });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao enviar convite. Verifique sua conexão e tente novamente.';
            }
            return next(erro);
        }
    }

    return Object.freeze({ consultarEmail, criarConvite });
}

export { criarContactInvitationController };
