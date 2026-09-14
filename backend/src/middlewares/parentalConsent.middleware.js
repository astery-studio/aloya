function criarParentalConsentMiddleware({
    parentalConsentService
}) {
    // Impede o acesso à Rede de Apoio enquanto a titular menor de 16 anos não possuir consentimento válido.
    async function exigirAcessoRedeApoio(req, _res, next) {
        try {
            const resultado =
                await parentalConsentService
                    .verificarAcessoRedeApoio(req.usuario.id);

            if (!resultado.acessoLiberado) {
                const erro = new Error(
                    'O acesso à Rede de Apoio depende da autorização de um responsável legal.'
                );

                erro.status = 403;
                erro.codigo = 'REDE_APOIO_BLOQUEADA';
                erro.detalhes = resultado;

                throw erro;
            }

            return next();
        } catch (erro) {
            return next(erro);
        }
    }

    return {
        exigirAcessoRedeApoio
    };
}

module.exports = {
    criarParentalConsentMiddleware
};