function criarPasswordRecoveryController({
    passwordRecoveryService,
    passwordRecoveryValidator
}) {
    async function solicitar(req, res, next) {
        try {
            const validacao = passwordRecoveryValidator
                .validarSolicitacao(req.body);

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: 'Informe um e-mail válido.',
                        detalhes: validacao.erros
                    }
                });
            }

            const resultado = await passwordRecoveryService
                .solicitar(validacao.dados.email);
            return res.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    async function validarToken(req, res, next) {
        try {
            const resultado = await passwordRecoveryService
                .validarToken(req.params.token);
            return res.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    return { solicitar, validarToken };
}

export { criarPasswordRecoveryController };
