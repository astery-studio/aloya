function criarParentalConsentMiddleware({
    parentalConsentService
}) {
    // Middleware que bloqueia exclusivamente recursos da Rede de Apoio.
    async function exigirAcessoRedeApoio(req, _res, next) {
        try {
            const acesso =
                await parentalConsentService
                    .verificarAcessoRedeApoio(req.usuario.id);

            if (!acesso.acessoLiberado) {
                const erro = new Error(
                    'O acesso à Rede de Apoio exige consentimento parental.'
                );

                erro.status = 403;
                erro.codigo = 'REDE_APOIO_BLOQUEADA';
                erro.detalhes = {
                    consentimentoNecessario:
                        acesso.consentimentoNecessario,

                    emailResponsavelInformado:
                        acesso.emailResponsavelInformado,

                    statusConsentimento:
                        acesso.statusConsentimento
                };

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