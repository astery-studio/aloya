//Mantém a rota de logout separada das rotas de autenticação da outra integrante
function criarLogoutRoutes({ Router, authMiddleware, logoutController }) {
    const router = Router()

    //A identidade vem exclusivamente do token e da sessão validada no banco.
    router.post(
        '/logout',
        authMiddleware.autenticar,
        logoutController.encerrarSessao
    )

    return router
}

export { criarLogoutRoutes }