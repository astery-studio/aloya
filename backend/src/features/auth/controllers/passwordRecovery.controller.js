/**
 * Controller HTTP que valida e delega solicitação, consulta e redefinição de senha.
 */
function criarPasswordRecoveryController({
    passwordRecoveryService,
    passwordRecoveryValidator
}) {
    function abrirNoAplicativo(req, res) {
        const token = typeof req.query?.token === 'string'
            ? req.query.token.trim()
            : '';

        if (!token) {
            return res.status(400).type('html').send(
                '<h1>Link inválido</h1><p>Solicite uma nova redefinição de senha no Aloya.</p>'
            );
        }

        const tokenCodificado = encodeURIComponent(token);
        const linkAplicativo = `aloya://reset-password?token=${tokenCodificado}`;
        const linkAndroid = `intent://reset-password?token=${tokenCodificado}`
            + '#Intent;scheme=aloya;package=com.aloya.app;end';

        return res.status(200).type('html').send(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Redefinir senha — Aloya</title>
</head>
<body style="margin:0;background:#f7f5f0;color:#222;font-family:Arial,sans-serif">
  <main style="max-width:520px;margin:48px auto;padding:32px;text-align:center">
    <h1 style="color:#2c4c3b">Redefinir sua senha</h1>
    <p>Toque no botão abaixo para continuar no aplicativo Aloya.</p>
    <p style="margin:32px 0">
      <a href="${linkAndroid}" style="display:block;padding:16px 24px;border-radius:12px;background:#2c4c3b;color:#fff;text-decoration:none;font-weight:bold">
        Abrir no Aloya
      </a>
    </p>
    <p style="font-size:14px;color:#5c5c59">
      Se o botão não abrir o aplicativo, <a href="${linkAplicativo}">toque aqui</a>.
    </p>
  </main>
</body>
</html>`);
    }

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

    async function redefinir(req, res, next) {
        try {
            const validacao = passwordRecoveryValidator
                .validarRedefinicao(req.body);

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: 'Não foi possível redefinir a senha.',
                        detalhes: validacao.erros
                    }
                });
            }

            const resultado = await passwordRecoveryService
                .redefinir(validacao.dados);
            return res.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    return { solicitar, validarToken, redefinir, abrirNoAplicativo };
}

export { criarPasswordRecoveryController };
