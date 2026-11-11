/**
 * Controller HTTP que valida entradas e delega cadastro, login e consentimento aos serviços.
 */
import {
    MENSAGEM_ERRO_CONFIRMACAO_CONSENTIMENTO,
    MENSAGEM_ERRO_ENVIO_CONSENTIMENTO
} from '../constants/parentalConsent.constants.js';

function criarPaginaConfirmacaoConsentimento() {
    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Autorização concluída — Astery</title>
            </head>

            <body style="box-sizing:border-box;min-height:100vh;margin:0;padding:64px 20px 28px;background:#F7F5F0;font-family:Arial,Helvetica,sans-serif;color:#222222;">
                <main style="box-sizing:border-box;width:100%;max-width:550px;margin:0 auto;padding:68px 36px 58px;border:1px solid #E6E2D8;border-radius:28px;background:#FFFFFF;text-align:center;">
                    <h1 style="max-width:420px;margin:0 auto 28px;font-size:38px;line-height:1.25;">
                        Autorização concluída<br />com sucesso
                    </h1>

                    <p style="margin:0 auto 34px;color:#5C5C59;font-size:23px;line-height:1.5;">
                        Sua participação como Responsável Legal<br />foi confirmada.
                    </p>

                    <p style="margin:0 auto 34px;padding:24px;border-radius:18px;background:#F7F5F0;color:#5C5C59;font-size:20px;line-height:1.5;">
                        Esta autorização não concede acesso à<br />conta ou às informações privadas do<br />titular.
                    </p>

                    <p style="margin:0;color:#2C4C3B;font-size:18px;font-weight:700;">
                        Você já pode fechar esta página.
                    </p>
                </main>

                <footer style="max-width:550px;margin:calc(100vh - 710px) auto 0;color:#77736D;font-size:14px;text-align:center;">
                    © 2026 Astery &nbsp; • &nbsp; Privacidade &nbsp; • &nbsp; Termos de uso
                </footer>
            </body>
        </html>
    `;
}

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
            const validacao = authValidator.validarCadastro(req.body);

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
            const resultado = await authService.cadastrar(validacao.dados, dispositivo);

            return res.status(201).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    // Processa a requisição HTTP de login.
    async function realizarLogin(req, res, next) {
        try {
            const validacao = authValidator.validarLogin(req.body);

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: 'Existem campos inválidos no login.',
                        detalhes: validacao.erros
                    }
                });
            }

            // Extrai e sanitiza o nome do dispositivo a partir do cabeçalho HTTP.
            const dispositivo =
                typeof req.headers['x-device-name'] === 'string'
                    ? req.headers['x-device-name'].slice(0, 120)
                    : null;

            const resultado = await authService.realizarLogin(validacao.dados, dispositivo);

            return res.status(200).json(resultado);
        } catch (erro) {
            // Define uma mensagem pública sem revelar detalhes internos.
            if (!erro.status) {
                erro.mensagemUsuario = 'Ocorreu um erro ao realizar login. Tente novamente.';
            }

            return next(erro);
        }
    }

    async function verificarEmail(req, res, next) {
        try {
            const validacao = authValidator.validarEmail(req.body);

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: 'Informe um e-mail válido.',
                        detalhes: validacao.erros
                    }
                });
            }

            const resultado = await authService.verificarEmailDisponivel(validacao.dados.email);

            return res.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    // Permite que o titular informe o e-mail do responsável depois do cadastro.
    async function solicitarConsentimento(req, res, next) {
        try {
            const validacao = parentalConsentValidator.validarSolicitacao(req.body);

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: validacao.erros[0].mensagem,
                        detalhes: validacao.erros
                    }
                });
            }

            const resultado = await parentalConsentService.solicitar(
                req.usuario.id,
                validacao.dados.emailResponsavelLegal
            );

            return res.status(200).json(resultado);
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_ENVIO_CONSENTIMENTO;
            return next(erro);
        }
    }

    // Reenvia o link ao último e-mail informado ou a um novo e-mail de responsável legal.
    async function reenviarConsentimento(req, res, next) {
        try {
            const validacao = parentalConsentValidator.validarReenvio(req.body);

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: validacao.erros[0].mensagem,
                        detalhes: validacao.erros
                    }
                });
            }

            const resultado = await parentalConsentService.reenviar(
                req.usuario.id,
                validacao.dados.emailResponsavelLegal
            );

            return res.status(200).json(resultado);
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_ENVIO_CONSENTIMENTO;
            return next(erro);
        }
    }

    // Confirma o consentimento pelo token recebido no link do e-mail.
    async function confirmarConsentimento(req, res, next) {
        try {
            const validacao = parentalConsentValidator.validarToken(req.params.token);

            if (!validacao.valido) {
                return res.status(400).json({
                    erro: {
                        codigo: 'LINK_CONSENTIMENTO_INVALIDO',
                        mensagem: 'O link de consentimento é inválido.'
                    }
                });
            }

            const resultado = await parentalConsentService.confirmar(validacao.dados.token);

            return res.status(200).type('html').send(criarPaginaConfirmacaoConsentimento());
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_CONFIRMACAO_CONSENTIMENTO;
            return next(erro);
        }
    }

    // Informa à interface se a Rede de Apoio está liberada ou se deve exibir a opção de solicitar consentimento.
    async function consultarStatusConsentimento(req, res, next) {
        try {
            const resultado = await parentalConsentService.verificarAcessoRedeApoio(req.usuario.id);

            res.set?.('Cache-Control', 'no-store');
            return res.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    return {
        cadastrar,
        realizarLogin,
        verificarEmail,
        solicitarConsentimento,
        reenviarConsentimento,
        confirmarConsentimento,
        consultarStatusConsentimento
    };
}

export { criarAuthController, criarPaginaConfirmacaoConsentimento };
