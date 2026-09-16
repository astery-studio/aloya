//Este controller responde à exclusão solicitada pelo próprio usuário
function criarAccountDeletionController({
    accountDeletionService,
    accountDeletionValidator
}) {
    //Retorna erros de validação antes de acessar o banco
    function responderErroValidacao(
        res,
        validacao
    ) {
        return res.status(422).json({
            erro: {
                codigo: 'ERRO_VALIDACAO',

                mensagem:
                    'Confirme sua senha e a exclusão permanente.',

                detalhes:
                    validacao.erros
            }
        })
    }

    //Recebe a confirmação do modal e exclui a conta autenticada
    async function excluirConta(
        req,
        res,
        next
    ) {
        try {
            const validacao =
                accountDeletionValidator
                    .validarExclusao(
                        req.body
                    )

            if (!validacao.valido) {
                return responderErroValidacao(
                    res,
                    validacao
                )
            }

            const resultado =
                await accountDeletionService
                    .excluirConta({
                        usuarioId:
                            req.usuario.id,

                        sessaoId:
                            req.usuario.sessaoId,

                        papel:
                            req.usuario.papel,

                        senhaAtual:
                            validacao.dados.senhaAtual
                    })

            return res.status(200).json(
                resultado
            )
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Não foi possível excluir sua conta. Nenhum dado foi alterado. Tente novamente.'
            }

            return next(erro)
        }
    }

    return {
        excluirConta
    }
}

export { criarAccountDeletionController }