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
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap"
                    rel="stylesheet"
                />

                <style>
                    :root {
                        color-scheme: light;
                        font-size: 100%;
                    }

                    * {
                        box-sizing: border-box;
                    }

                    html,
                    body {
                        width: 100%;
                        min-height: 100%;
                        margin: 0;
                    }

                    body {
                        display: flex;
                        min-height: 100svh;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        background: #181c1a;
                        background: color(srgb 0.0941 0.1098 0.102);
                        font-family: "DM Sans", Arial, Helvetica, sans-serif;
                    }

                    .pagina {
                        display: grid;
                        width: min(100%, 25.125rem);
                        min-height: min(54.625rem, 100svh);
                        flex-shrink: 0;
                        grid-template-rows: 4rem minmax(0, 1fr) minmax(4rem, auto);
                        grid-template-columns: minmax(0, 1fr);
                        background: #f7f5f0;
                        background: color(srgb 0.9686 0.9608 0.9412);
                    }

                    .cartao {
                        display: flex;
                        width: calc(100% - 2.5rem);
                        max-width: 32.5rem;
                        padding: 2.25rem 1.5rem;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        align-self: start;
                        grid-row: 2;
                        grid-column: 1;
                        justify-self: center;
                        border: 0.0416875rem solid #e6e2d8;
                        border-color: color(srgb 0.902 0.8863 0.8471);
                        border-radius: 1.25rem;
                        background: #ffffff;
                        background: color(srgb 1 1 1);
                    }

                    .container-titulo {
                        display: flex;
                        width: 100%;
                        max-width: 24.375rem;
                        padding-top: 0.625rem;
                        flex-direction: column;
                        align-items: center;
                    }

                    .titulo {
                        width: 100%;
                        margin: 0;
                        color: #222222;
                        color: color(srgb 0.1333 0.1333 0.1333);
                        text-align: center;
                        font-size: 1.625rem;
                        font-style: normal;
                        font-weight: 700;
                        line-height: 1.95rem;
                        letter-spacing: -0.0325rem;
                    }

                    .container-frase {
                        display: flex;
                        width: 100%;
                        padding-top: 1rem;
                        flex-direction: column;
                        align-items: center;
                    }

                    .frase {
                        width: 100%;
                        margin: 0;
                        color: #5c5c59;
                        color: color(srgb 0.3608 0.3608 0.349);
                        text-align: center;
                        font-size: 1rem;
                        font-style: normal;
                        font-weight: 400;
                        line-height: 1.6rem;
                    }

                    .container-destaque {
                        display: flex;
                        width: 100%;
                        padding-top: 1.5rem;
                        flex-direction: column;
                        align-items: center;
                        align-self: stretch;
                    }

                    .caixa-destaque {
                        display: flex;
                        width: 100%;
                        padding: 0.875rem 1rem;
                        flex-direction: column;
                        align-items: center;
                        align-self: stretch;
                        border-radius: 0.75rem;
                        background: #f7f5f0;
                        background: color(srgb 0.9686 0.9608 0.9412);
                    }

                    .frase-destaque {
                        width: 100%;
                        max-width: 17.5625rem;
                        margin: 0;
                        color: #5c5c59;
                        color: color(srgb 0.3608 0.3608 0.349);
                        text-align: center;
                        font-size: 0.875rem;
                        font-style: normal;
                        font-weight: 400;
                        line-height: 1.35625rem;
                    }

                    .rodape {
                        display: flex;
                        min-height: 4rem;
                        padding: 1rem 1.5rem 1.5rem;
                        justify-content: center;
                        align-items: center;
                        gap: 0.625rem;
                        align-self: stretch;
                        grid-row: 3;
                        grid-column: 1;
                        justify-self: stretch;
                        color: #77736e;
                        color: color(srgb 0.4667 0.4549 0.4314);
                        font-size: 0.8125rem;
                        font-style: normal;
                        font-weight: 400;
                        line-height: 1.21875rem;
                        text-align: center;
                    }

                    .rodape__legal {
                        color: #5c5c59;
                        color: color(srgb 0.3608 0.3608 0.349);
                    }

                    @media (max-width: 22rem) {
                        .pagina {
                            grid-template-rows: 2rem minmax(0, 1fr) auto;
                        }

                        .cartao {
                            width: calc(100% - 1.5rem);
                            padding: 1.75rem 1.125rem;
                        }

                        .titulo {
                            font-size: 1.375rem;
                            line-height: 1.7rem;
                        }

                        .rodape {
                            padding-inline: 0.75rem;
                            flex-wrap: wrap;
                            gap: 0.375rem;
                        }
                    }

                    @media (max-height: 36rem) {
                        .pagina {
                            grid-template-rows: 1rem minmax(0, 1fr) auto;
                        }

                        .cartao {
                            align-self: center;
                            padding-block: 1.5rem;
                        }
                    }
                </style>
            </head>

            <body>
                <div class="pagina">
                    <main class="cartao">
                        <div class="container-titulo">
                            <h1 class="titulo">Autorização concluída com sucesso</h1>
                        </div>

                        <div class="container-frase">
                            <p class="frase">
                                Sua participação como Responsável Legal foi confirmada.
                            </p>
                        </div>

                        <div class="container-destaque">
                            <div class="caixa-destaque">
                                <p class="frase-destaque">
                                    Esta autorização não concede acesso à conta ou às informações privadas do titular.
                                </p>
                            </div>
                        </div>
                    </main>

                    <footer class="rodape">
                        <span>Astery</span>
                        <span aria-hidden="true">•</span>
                        <span class="rodape__legal">Privacidade</span>
                        <span aria-hidden="true">•</span>
                        <span class="rodape__legal">Termos de uso</span>
                    </footer>
                </div>
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

            await parentalConsentService.confirmar(validacao.dados.token);

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
