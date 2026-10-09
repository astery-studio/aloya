//Recebe o pedido de logout da sessão autenticada
function criarLogoutController({ logoutService }) {
    async function encerrarSessao(req, res, next) {
        try {
            await logoutService.encerrarSessao({
                usuarioId: req.usuario.id,
                sessaoId: req.usuario.sessaoId
            })

            //A resposta não deve ser armazenada em cache.
            res.set(
                'Cache-Control',
                'no-store'
            )

            //204 significa sucesso sem devolver token ou dados da conta.
            return res.status(204).send()

        //Se o banco falhar, não declara que o logout foi concluído.
        } catch (erro) {
            return next(erro)
        }
    }

    return { encerrarSessao }
}

export { criarLogoutController }