function criarAuthController({
    authService,
    authValidator,
    parentalConsentService,
    parentalConsentValidator
}) {
    // Função responsável por processar a requisição HTTP de cadastro
    async function cadastrar(req, res, next) {
        try {
            const validacao =
                authValidator.validarCadastro(req.body);

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: 'Existem campos inválidos no cadastro.',
                        detalhes: validacao.erros
                    }
                });
            }

            const dispositivo =
                typeof req.headers['x-device-name'] === 'string'
                    ? req.headers['x-device-name'].slice(0, 120)
                    : null;

            const resultado = await authService.cadastrar(
                validacao.dados,
                dispositivo
            );

            return res.status(201).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    // Permite que o titular informe o e-mail do responsável posteriormente
    async function solicitarConsentimento(req, res, next) {
        try {
            const validacao =
                parentalConsentValidator.validarSolicitacao(
                    req.body
                );

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: 'Existe um campo inválido.',
                        detalhes: validacao.erros
                    }
                });
            }

            const resultado =
                await parentalConsentService.solicitar(
                    req.usuario.id,
                    validacao.dados.emailResponsavelLegal
                );

            return res.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    // Permite reenviar o e-mail ao responsável legal já informado
    async function reenviarConsentimento(req, res, next) {
        try {
            const resultado =
                await parentalConsentService.reenviar(
                    req.usuario.id
                );

            return res.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    // Recebe o clique público do responsável legal no link do e-mail
    async function confirmarConsentimento(req, res, next) {
        try {
            const resultado =
                await parentalConsentService.confirmar(
                    req.params.token
                );

            return res.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    return {
        cadastrar,
        solicitarConsentimento,
        reenviarConsentimento,
        confirmarConsentimento
    };
}

module.exports = {
    criarAuthController
};