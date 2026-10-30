function criarPermissionCategoryDeletionController({
    permissionCategoryDeletionService,
    permissionCategoryDeletionValidator,
    permissionCategoryValidator
}) {
    function validarCategoriaId(req, res) {
        try {
            return permissionCategoryValidator.validarIdCategoria(req.params?.id);
        } catch {
            res.status(400).json({
                erro: {
                    codigo: 'ID_CATEGORIA_INVALIDO',
                    mensagem: 'Identificador de categoria inválido.'
                }
            });

            return null;
        }
    }

    async function consultarImpacto(req, res, next) {
        try {
            const categoriaId = validarCategoriaId(req, res);

            if (categoriaId === null) {
                return undefined;
            }

            const impacto = await permissionCategoryDeletionService.consultarImpacto({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                categoriaId
            });

            res.set('Cache-Control', 'private, no-store');
            res.set('Pragma', 'no-cache');

            return res.status(200).json(impacto);
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    'Não foi possível carregar os dados da categoria. Tente novamente.';
            }

            return next(erro);
        }
    }

    async function excluirCategoria(req, res, next) {
        try {
            const categoriaId = validarCategoriaId(req, res);

            if (categoriaId === null) {
                return undefined;
            }

            const validacao = permissionCategoryDeletionValidator.validarExclusaoCategoria(
                req.body
            );

            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: validacao.erros[0].mensagem,
                        detalhes: validacao.erros
                    }
                });
            }

            const resultado = await permissionCategoryDeletionService.excluirCategoria({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                categoriaId,
                atualizadoEm: validacao.dados.atualizadoEm,
                decisoes: validacao.dados.decisoes
            });

            res.set('Cache-Control', 'no-store');

            return res.status(200).json({
                mensagem: 'Categoria excluída com sucesso.',
                resultado
            });
        } catch (erro) {
            if (erro.codigo === 'IMPACTO_EXCLUSAO_ALTERADO') {
                return res.status(409).json({
                    erro: {
                        codigo: erro.codigo,
                        mensagem: erro.message,
                        detalhes: {
                            quantidadeContatos: erro.quantidadeContatos
                        }
                    }
                });
            }

            if (!erro.status) {
                erro.mensagemUsuario =
                    'Ocorreu um erro ao deletar. Verifique sua conexão e tente novamente.';
            }

            return next(erro);
        }
    }

    return {
        consultarImpacto,
        excluirCategoria
    };
}

export { criarPermissionCategoryDeletionController };
