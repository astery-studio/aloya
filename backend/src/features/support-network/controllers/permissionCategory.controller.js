//Recebe a criação de categorias e usa exclusivamente a identidade obtida da sessão.
function criarPermissionCategoryController({permissionCategoryService, permissionCategoryValidator}) {
    function responderErroValidacao(res, validacao) {
        const primeiroErro = validacao.erros[0]

        return res.status(422).json({
            erro: {
                codigo: 'ERRO_VALIDACAO',
                mensagem: primeiroErro.mensagem,
                detalhes: validacao.erros
            }
        })
    }

    //Valida a requisição e cria uma categoria para a titular autenticada.
    async function criarCategoria(req, res, next) {
        try {
            const validacao = permissionCategoryValidator.validarCriacaoCategoria(req.body)

            if (!validacao.valido) {
                return responderErroValidacao(res, validacao)
            }

            const categoria = await permissionCategoryService.criarCategoria({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                nome: validacao.dados.nome,
                dadosVisiveis: validacao.dados.dadosVisiveis
            })

            res.set('Cache-Control', 'no-store')

            return res.status(201).json({
                mensagem: 'Categoria criada com sucesso.',
                categoria
            })
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario = 'Ocorreu um erro ao criar sua categoria. Verifique sua conexão e tente novamente.'
            }

            return next(erro)
        }
    }

    return {
        criarCategoria
    }
}

export { criarPermissionCategoryController }