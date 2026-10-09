//Funcao factory para criar o controller de conta.
function criarAccountController({ accountService, accountValidator }) {
    //Função auxiliar para responder com erro de validação.
    function responderErroValidacao(
        res,
        validacao
    ) {
        return res.status(422).json({
            erro: {
                codigo: 'ERRO_VALIDACAO',

                mensagem:
                    'Existem campos inválidos nas configurações da conta.',

                detalhes: validacao.erros
            }
        })
    }

    //Função para buscar as configurações da conta do usuário.
    async function buscarConfiguracoes(
        req,
        res,
        next
    ) {
        try {
            const configuracoes =
                await accountService
                    .buscarConfiguracoes(
                        req.usuario.id
                    )

            return res.status(200).json({
                configuracoes
            })
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao carregar as configurações. Tente novamente.'
            }

            return next(erro)
        }
    }

    //Função para atualizar as configurações da conta do usuário.
    async function atualizarConfiguracoes(
        req,
        res,
        next
    ) {
        try {
            const validacao =
                accountValidator
                    .validarAtualizacao(
                        req.body
                    )

            if (!validacao.valido) {
                return responderErroValidacao(
                    res,
                    validacao
                )
            }

            const resultado =
                await accountService
                    .atualizarConfiguracoes(
                        req.usuario.id,
                        validacao.dados
                    )

            return res.status(200).json({
                mensagem:
                    'Dados atualizados com sucesso.',

                ...resultado
            })
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao atualizar seus dados. Tente novamente.'
            }

            return next(erro)
        }
    }

    //Função para alterar a senha do usuário.
    async function alterarSenha(
        req,
        res,
        next
    ) {
        try {
            const validacao =
                accountValidator
                    .validarAlteracaoSenha(
                        req.body
                    )

            if (!validacao.valido) {
                return responderErroValidacao(
                    res,
                    validacao
                )
            }

            const resultado =
                await accountService.alterarSenha({
                    usuarioId: req.usuario.id,

                    sessaoId:
                        req.usuario.sessaoId,

                    senhaAtual:
                        validacao.dados.senhaAtual,

                    novaSenha:
                        validacao.dados.novaSenha
                })

            return res.status(200).json(
                resultado
            )
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao alterar sua senha. Tente novamente.'
            }

            return next(erro)
        }
    }

    return {
        buscarConfiguracoes,
        atualizarConfiguracoes,
        alterarSenha
    }
}

export { criarAccountController }