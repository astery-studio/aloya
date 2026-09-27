//Este service exclui a conta autenticada e seus dados em uma transação
function criarAccountDeletionService({
    prisma,
    passwordService,
    now = () => new Date()
}) {
    //Cria um erro controlado sem expor detalhes do banco
    function criarErro(
        mensagem,
        status,
        codigo
    ) {
        const erro = new Error(mensagem)

        erro.status = status
        erro.codigo = codigo

        return erro
    }

    //Confirma que a sessão atual possui um identificador válido
    function validarSessaoId(sessaoId) {
        if (
            !Number.isInteger(sessaoId)
            || sessaoId <= 0
        ) {
            throw criarErro(
                'Sua sessão não está mais ativa.',
                401,
                'SESSAO_INVALIDA'
            )
        }
    }

    //Somente contas do perfil principal podem executar a HU-005
    function validarPapel(papel) {
        const podeExcluir =
            papel === 'principal'
            || papel ===
                'principal_e_contato_apoio'

        if (!podeExcluir) {
            throw criarErro(
                'Esta ação não está disponível para esta conta.',
                403,
                'EXCLUSAO_NAO_PERMITIDA'
            )
        }
    }

    //Busca somente os dados necessários para autorizar a exclusão
    async function buscarUsuario(usuarioId) {
        const usuario =
            await prisma.usuario.findUnique({
                where: {
                    id: usuarioId
                },

                select: {
                    id: true,
                    email: true,
                    papel: true,
                    statusConta: true,
                    senhaHash: true
                }
            })

        if (!usuario) {
            throw criarErro(
                'Conta não encontrada.',
                404,
                'CONTA_NAO_ENCONTRADA'
            )
        }

        return usuario
    }

    //Confirma a senha vigente antes de iniciar qualquer exclusão
    async function validarSenha(
        senhaAtual,
        senhaHash
    ) {
        const senhaCorreta =
            await passwordService.compararSenha(
                senhaAtual,
                senhaHash
            )

        if (!senhaCorreta) {
            throw criarErro(
                'A senha atual está incorreta.',
                401,
                'SENHA_ATUAL_INCORRETA'
            )
        }
    }

    //Valida a conta, o papel e a senha sem executar nenhuma exclusão.
    async function autorizarExclusao({usuarioId, sessaoId, papel, senhaAtual}) {
        validarSessaoId(sessaoId)
        validarPapel(papel)

        const usuario = await buscarUsuario(usuarioId)

        validarPapel(usuario.papel)

        if (usuario.statusConta !== 'ativa') {
            throw criarErro(
                'Sua sessão não está mais ativa.',
                401,
                'SESSAO_INVALIDA'
            )
        }

        await validarSenha(
            senhaAtual,
            usuario.senhaHash
        )

        return usuario
    }

    //Confere a senha no primeiro modal sem modificar ou excluir dados.
    async function confirmarSenhaExclusao(dados) {
        await autorizarExclusao(dados)
    }

    //Remove vínculos que pertencem à titular ou contêm dados dela como contato
    async function removerVinculos(
        tx,
        usuario,
        momentoExclusao
    ) {
        const vinculos =
            await tx.vinculoRedeApoio.findMany({
                where: {
                    OR: [
                        {
                            titularId: usuario.id
                        },

                        {
                            contatoId: usuario.id
                        },

                        {
                            emailConvidado:
                                usuario.email
                        }
                    ]
                },

                select: {
                    id: true,
                    titularId: true,
                    contatoId: true,
                    status: true
                }
            })

        if (vinculos.length === 0) {
            return
        }

        const vinculoIds =
            vinculos.map(
                (vinculo) =>
                    vinculo.id
            )

        //A origemId é polimórfica: retira notificações que ainda apontariam para vínculos removidos
        await tx.notificacao.deleteMany({
            where: {
                tipoOrigem: 'rede_apoio',

                origemId: {
                    in: vinculoIds
                }
            }
        })

        //Resolve a relação Restrict com CategoriaPermissao antes de excluir a conta da titular
        await tx.vinculoRedeApoio.deleteMany({
            where: {
                id: {
                    in: vinculoIds
                }
            }
        })

        const contatoIds = [...new Set(
            vinculos
                .filter((vinculo) => (
                    vinculo.titularId === usuario.id
                    && vinculo.status === 'ativo'
                    && Number.isInteger(vinculo.contatoId)
                ))
                .map((vinculo) => vinculo.contatoId)
        )]

        if (contatoIds.length > 0) {
            await tx.notificacao.createMany({
                data: contatoIds.map((contatoId) => ({
                    usuarioId: contatoId,
                    tipoOrigem: 'rede_apoio',
                    origemId: null,
                    dataHoraProgramada: momentoExclusao,
                    statusEnvio: 'agendada'
                }))
            })
        }
    }

    //Executa a exclusão somente para a própria conta autenticada
    async function excluirConta({usuarioId, sessaoId, papel, senhaAtual}) {
        const usuario = await autorizarExclusao({
            usuarioId,
            sessaoId,
            papel,
            senhaAtual
        })

        const momentoExclusao = now()

        //Nenhuma exclusão acontece antes da senha ser confirmada
        await prisma.$transaction(
            async function removerDados(tx) {
                const sessaoAtual =
                    await tx.sessao.findFirst({
                        where: {
                            id: sessaoId,
                            usuarioId,

                            revogadaEm: null,

                            validadeSessao: {
                                gt: momentoExclusao
                            }
                        },

                        select: {
                            id: true
                        }
                    })


                if (!sessaoAtual) {
                    throw criarErro(
                        'Sua sessão não está mais ativa.',
                        401,
                        'SESSAO_INVALIDA'
                    )
                }

                await removerVinculos(
                    tx,
                    usuario,
                    momentoExclusao
                )

                //O hash no filtro impede que uma troca de senha concorrente autorize uma exclusão com senha antiga
                const exclusao =
                    await tx.usuario.deleteMany({
                        where: {
                            id: usuarioId,

                            senhaHash:
                                usuario.senhaHash,

                            statusConta: 'ativa'
                        }
                    })

                if (exclusao.count !== 1) {
                    //A transação desfaz também a remoção dos vínculos
                    throw criarErro(
                        'A conta foi alterada durante a exclusão. Entre novamente e repita a operação.',
                        409,
                        'CONTA_ALTERADA_CONCORRENTEMENTE'
                    )
                }
            }
        )

        //Nunca retorna senha, hash, token ou dados da conta excluída
        return {
            mensagem:
                'Sua conta foi excluída com sucesso.'
        }
    }

    return {confirmarSenhaExclusao, excluirConta}
}

export { criarAccountDeletionService }
