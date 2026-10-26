//Recebe operações de categorias e usa exclusivamente a identidade obtida da sessão.
function criarPermissionCategoryController({
    permissionCategoryService,
    permissionCategoryValidator
}) {
    function responderErroValidacao(res, validacao) {
        const primeiroErro = validacao.erros[0];

        return res.status(422).json({
            erro: {
                codigo: 'ERRO_VALIDACAO',
                mensagem: primeiroErro.mensagem,
                detalhes: validacao.erros
            }
        });
    }

    //Valida a requisição e cria uma categoria para a titular autenticada.
    async function criarCategoria(req, res, next) {
        try {
            const validacao = permissionCategoryValidator.validarCriacaoCategoria(req.body);

            if (!validacao.valido) {
                return responderErroValidacao(res, validacao);
            }

            const categoria = await permissionCategoryService.criarCategoria({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                nome: validacao.dados.nome,
                dadosVisiveis: validacao.dados.dadosVisiveis
            });

            res.set('Cache-Control', 'no-store');

            return res.status(201).json({
                mensagem: 'Categoria criada com sucesso.',
                categoria
            });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao criar sua categoria. Verifique sua conexão e tente novamente.';
            }

            return next(erro);
        }
    }

    //Lista as categorias da titular sem aceitar filtros de identidade enviados pelo cliente.
    async function listarCategorias(req, res, next) {
        try {
            const categorias = await permissionCategoryService.listarCategorias({
                titularId: req.usuario.id,
                papel: req.usuario.papel
            });

            res.set('Cache-Control', 'private, no-store');
            res.set('Pragma', 'no-cache');

            return res.status(200).json({
                categorias
            });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Não foi possível carregar suas categorias no momento. Tente novamente.';
            }

            return next(erro);
        }
    }

    //Atualiza a categoria identificada na rota usando somente a identidade autenticada.
    async function editarCategoria(req, res, next) {
        try {
            let categoriaId

            try {
                categoriaId = permissionCategoryValidator.validarIdCategoria(req.params?.id)
            } catch {
                return res.status(400).json({
                    erro: {
                        codigo: 'ID_CATEGORIA_INVALIDO',
                        mensagem: 'Identificador de categoria inválido.'
                    }
                })
            }

            const validacao = permissionCategoryValidator.validarEdicaoCategoria(req.body)

            if (!validacao.valido) {
                return responderErroValidacao(res, validacao)
            }

            const categoria = await permissionCategoryService.editarCategoria({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                categoriaId,
                nome: validacao.dados.nome,
                dadosVisiveis: validacao.dados.dadosVisiveis,
                atualizadoEm: validacao.dados.atualizadoEm,
                quantidadeContatosConfirmada: validacao.dados.quantidadeContatosConfirmada
            })

            res.set('Cache-Control', 'no-store')

            return res.status(200).json({
                mensagem: 'Categoria atualizada com sucesso.',
                categoria
            })
        } catch (erro) {
            if (erro.codigo === 'CONFIRMACAO_IMPACTO_NECESSARIA') {
                return res.status(409).json({
                    erro: {
                        codigo: erro.codigo,
                        mensagem: erro.message,
                        detalhes: {
                            quantidadeContatos: erro.quantidadeContatos
                        }
                    }
                })
            }

            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao atualizar sua categoria. Verifique sua conexão e tente novamente.'
            }

            return next(erro)
        }
    }

    return {
        criarCategoria,
        listarCategorias,
        editarCategoria
    };
}

export { criarPermissionCategoryController };
