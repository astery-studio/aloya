function criarAuthController({
    authService,
    authValidator,
    parentalConsentService,
    parentalConsentValidator
}) {
    // Função responsável por processar a requisição HTTP de cadastro de nova conta.
    async function cadastrar(req, res, next) {
        try {
            // Executa a validação de formato e integridade dos dados enviados no corpo da requisição.
            const validacao = authValidator.validarCadastro(
                req.body
            );

            // Se a validação falhar, interrompe o fluxo e retorna os detalhes dos erros.
            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: 'Existem campos inválidos no cadastro.',
                        detalhes: validacao.erros
                    }
                });
            }

            // Extrai e sanitiza o nome do dispositivo a partir do cabeçalho HTTP.
            const dispositivo =
                typeof req.headers['x-device-name'] === 'string'
                    ? req.headers['x-device-name'].slice(0, 120)
                    : null;

            // Delega ao serviço de autenticação a criação segura da conta e o consentimento parental.
            const resultado = await authService.cadastrar(
                validacao.dados,
                dispositivo
            );

            return res.status(201).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    // Permite que a titular informe o e-mail do responsável depois do cadastro.
    async function solicitarConsentimento(req, res, next) {
        try {
            const validacao =
                parentalConsentValidator.validarSolicitacao(req.body);

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: 'Existem campos inválidos na solicitação.',
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

    // Reenvia o link ao último e-mail informado ou a um novo e-mail de responsável legal.
    async function reenviarConsentimento(req, res, next) {
        try {
            const validacao =
                parentalConsentValidator.validarReenvio(req.body);

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: 'Existem campos inválidos no reenvio.',
                        detalhes: validacao.erros
                    }
                });
            }

            const resultado =
                await parentalConsentService.reenviar(
                    req.usuario.id,
                    validacao.dados.emailResponsavelLegal
                );

            return res.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    // Confirma o consentimento pelo token recebido no link do e-mail.
    async function confirmarConsentimento(req, res, next) {
        try {
            const validacao =
                parentalConsentValidator.validarToken(
                    req.params.token
                );

            if (!validacao.valido) {
                return res.status(400).json({
                    erro: {
                        codigo: 'LINK_CONSENTIMENTO_INVALIDO',
                        mensagem: 'O link de consentimento é inválido.'
                    }
                });
            }

            const resultado =
                await parentalConsentService.confirmar(
                    validacao.dados.token
                );

            return res.status(200).type('html').send(`
                //ISSO DEVE SER TEMPORÁRIO 
                <!DOCTYPE html>
                <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Autorização confirmada — ALOYA</title>
                    </head>

                    <body style="margin:0;background:#F7F5F0;font-family:Arial,sans-serif;color:#222222;">
                        <main style="max-width:560px;margin:80px auto;padding:32px;background:#FFFFFF;border-radius:12px;text-align:center;">
                            <h1 style="margin-top:0;color:#2C4C3B;">
                                Autorização concluída
                            </h1>

                            <p style="line-height:1.6;">
                                ${resultado.mensagem}
                            </p>

                            <p style="color:#5C5C59;font-size:14px;">
                                A Rede de Apoio foi liberada conforme a autorização concedida.
                            </p>
                        </main>
                    </body>
                </html>
            `);
        } catch (erro) {
            return next(erro);
        }
    }

    // Informa à interface se a Rede de Apoio está liberada ou se deve exibir a opção de solicitar consentimento.
    async function consultarStatusConsentimento(req, res, next) {
        try {
            const resultado =
                await parentalConsentService
                    .verificarAcessoRedeApoio(req.usuario.id);

            return res.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    return {
        cadastrar,
        solicitarConsentimento,
        reenviarConsentimento,
        confirmarConsentimento,
        consultarStatusConsentimento
    };
}

module.exports = {
    criarAuthController
};