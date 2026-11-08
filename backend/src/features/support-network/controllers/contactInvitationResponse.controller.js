function criarContactInvitationResponseController({
    service,
    invitationValidator,
    registrationValidator
} = {}) {
    if (
        typeof service?.consultar !== 'function' ||
        typeof service?.cadastrarContato !== 'function' ||
        typeof service?.aceitar !== 'function' ||
        typeof service?.recusar !== 'function' ||
        typeof invitationValidator?.validarTokenConvite !== 'function' ||
        typeof invitationValidator?.validarRespostaConvite !== 'function' ||
        typeof registrationValidator?.validar !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar a resposta aos convites.');
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

    function validarToken(req, res) {
        const validacao = invitationValidator.validarTokenConvite(req.params?.token);
        if (!validacao.valido) {
            responderValidacao(res, validacao);
            return null;
        }
        return validacao.dados.token;
    }

    async function consultar(req, res, next) {
        try {
            const token = validarToken(req, res);
            if (!token) return undefined;
            const convite = await service.consultar(token);
            res.set('Cache-Control', 'private, no-store');
            return res.status(200).json({ convite });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Não foi possível carregar este convite. Verifique sua conexão e tente novamente.';
            }
            return next(erro);
        }
    }

    async function cadastrarContato(req, res, next) {
        try {
            const token = validarToken(req, res);
            if (!token) return undefined;
            const validacao = registrationValidator.validar(req.body);
            if (!validacao.valido) return responderValidacao(res, validacao);
            const resultado = await service.cadastrarContato(token, validacao.dados);
            res.set('Cache-Control', 'no-store');
            return res.status(201).json(resultado);
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao criar sua conta. Verifique sua conexão e tente novamente.';
            }
            return next(erro);
        }
    }

    async function responder(req, res, next) {
        try {
            const token = validarToken(req, res);
            if (!token) return undefined;
            const validacao = invitationValidator.validarRespostaConvite(req.body);
            if (!validacao.valido) return responderValidacao(res, validacao);
            const operacao =
                validacao.dados.acao === 'aceitar' ? service.aceitar : service.recusar;
            const resultado = await operacao({ token, usuarioId: req.usuario.id });
            res.set('Cache-Control', 'no-store');
            return res.status(200).json(resultado);
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao responder ao convite. Verifique sua conexão e tente novamente.';
            }
            return next(erro);
        }
    }

    return Object.freeze({ cadastrarContato, consultar, responder });
}

export { criarContactInvitationResponseController };
