//Funcao para criar as rotas de conta
function criarAccountRoutes({
    Router,
    accountController,
    authMiddleware,
    configuracoesContaRateLimit,
    alteracaoSenhaRateLimit,
    accountDeletionController,
    exclusaoContaRateLimit
}) {
    const router = Router()

    //Todas as rotas usam o usuário obtido da sessão. Nenhum usuarioId é aceito na URL ou no body
    //Rota de autenticação é feita no middleware authMiddleware.autenticar, que adiciona o usuário à requisição
    router.use(
        authMiddleware.autenticar
    )

    //Rota para buscar as configurações da conta do usuário.
    router.get(
        '/me',
        accountController.buscarConfiguracoes
    )

    //Rota para atualizar as configurações da conta do usuário.
    router.patch(
        '/me',
        configuracoesContaRateLimit,
        accountController.atualizarConfiguracoes
    )

    //Rota para alterar a senha do usuário.
    router.patch(
        '/me/password',
        alteracaoSenhaRateLimit,
        accountController.alterarSenha
    )

    return router
}

export { criarAccountRoutes }