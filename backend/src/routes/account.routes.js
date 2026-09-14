const {Router} = require('express')

//Funcao para criar as rotas de conta
function criarAccountRoutes({
    accountController,
    authMiddleware,
    configuracoesContaRateLimit,
    alteracaoSenhaRateLimit
}) {
    const router = Router()

    //Todas as rotas usam o usuário obtido da sessão. Nenhum usuarioId é aceito na URL ou no body
    router.use(
        authMiddleware.autenticar
    )

    router.get(
        '/me',
        accountController.buscarConfiguracoes
    )

    router.patch(
        '/me',
        configuracoesContaRateLimit,
        accountController.atualizarConfiguracoes
    )

    router.patch(
        '/me/password',
        alteracaoSenhaRateLimit,
        accountController.alterarSenha
    )

    return router
}

module.exports = {criarAccountRoutes}