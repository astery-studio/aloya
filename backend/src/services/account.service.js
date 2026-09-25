function criarAccountService({ prisma, passwordService, parentalConsentService, dateUtils, now = () => new Date() }) {
    const selectConfiguracoes = {
        id: true,
        nome: true,
        email: true,
        genero: true,
        dataNascimento: true,
        atualizadoEm: true
    }

    // Função auxiliar para criar um erro de conta não encontrada
    function criarErroContaNaoEncontrada() {
        const erro = new Error(
            'Conta não encontrada.'
        )

        erro.status = 404;
        erro.codigo = 'CONTA_NAO_ENCONTRADA'

        return erro
    }

    // Função auxiliar para formatar a data no formato ISO (YYYY-MM-DD)
    function formatarData(data) {
        return data.toISOString().slice(0, 10)
    }

    // Função auxiliar para formatar as configurações do usuário
    function formatarConfiguracoes(usuario) {
        return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,

            identidadeGenero:
                usuario.genero,

            dataNascimento: formatarData(
                usuario.dataNascimento
            ),

            atualizadoEm:
                usuario.atualizadoEm
        }
    }

    // Função auxiliar para comparar duas datas (ignorando a hora)
    function datasSaoIguais(
        dataAtual,
        novaData
    ) {
        return (
            dataAtual.getFullYear()
                === novaData.getFullYear()
            && dataAtual.getMonth()
                === novaData.getMonth()
            && dataAtual.getDate()
                === novaData.getDate()
        )
    }

    // Função para buscar as configurações do usuário
    async function buscarConfiguracoes(usuarioId) {
        const usuario =
            await prisma.usuario.findUnique({
                where: {
                    id: usuarioId
                },

                select: selectConfiguracoes
            })

        if (!usuario) {
            throw criarErroContaNaoEncontrada()
        }

        return formatarConfiguracoes(usuario)
    }

    // Função para verificar se o e-mail está disponível para atualização
    async function verificarEmailDisponivel(
        usuarioId,
        email
    ) {
        const usuarioComEmail =
            await prisma.usuario.findUnique({
                where: {
                    email
                },

                select: {
                    id: true
                }
            })

        if (
            usuarioComEmail
            && usuarioComEmail.id !== usuarioId
        ) {
            const erro = new Error(
                'Este e-mail já está em uso.'
            )

            erro.status = 409;
            erro.codigo = 'EMAIL_JA_CADASTRADO'

            throw erro
        }
    }

    // Função para identificar as alterações feitas nas configurações do usuário
    function identificarAlteracoes(
        usuarioAtual,
        dados
    ) {
        const alteracoes = {}

        if (
            dados.nome !== undefined
            && dados.nome !== usuarioAtual.nome
        ) {
            alteracoes.nome = dados.nome
        }

        if (
            dados.email !== undefined
            && dados.email !== usuarioAtual.email
        ) {
            alteracoes.email = dados.email
        }

        if (
            dados.identidadeGenero !== undefined
            && dados.identidadeGenero
                !== usuarioAtual.genero
        ) {
            alteracoes.genero =
                dados.identidadeGenero
        }

        if (
            dados.dataNascimento !== undefined
            && !datasSaoIguais(
                usuarioAtual.dataNascimento,
                dados.dataNascimento
            )
        ) {
            alteracoes.dataNascimento =
                dados.dataNascimento
        }

        return alteracoes
    }

    // Função para atualizar as configurações do usuário
    async function atualizarConfiguracoes(
        usuarioId,
        dados
    ) {
        const usuarioAtual =
            await prisma.usuario.findUnique({
                where: {
                    id: usuarioId
                },

                select: selectConfiguracoes
            })

        if (!usuarioAtual) {
            throw criarErroContaNaoEncontrada()
        }

        const alteracoes = identificarAlteracoes(
            usuarioAtual,
            dados
        )

        if (Object.keys(alteracoes).length === 0) {
            const erro = new Error(
                'Nenhuma alteração foi identificada.'
            )

            erro.status = 422;
            erro.codigo = 'NENHUMA_ALTERACAO'

            throw erro
        }

        if (alteracoes.email !== undefined) {
            await verificarEmailDisponivel(
                usuarioId,
                alteracoes.email
            )
        }

        const momentoAtual = now();

        const idadeAnterior =
            dateUtils.calcularIdade(
                usuarioAtual.dataNascimento,
                momentoAtual
            )

        const dataNascimentoAtualizada =
            alteracoes.dataNascimento
            || usuarioAtual.dataNascimento;

        const idadeAtualizada =
            dateUtils.calcularIdade(
                dataNascimentoAtualizada,
                momentoAtual
            )

        const passouASerMenorDe16 =
            alteracoes.dataNascimento !== undefined
            && idadeAnterior >= 16
            && idadeAtualizada < 16;

        try {
            const usuarioAtualizado =
                await prisma.$transaction(
                    async function salvarAlteracoes(tx) {
                        const usuario =
                            await tx.usuario.update({
                                where: {
                                    id: usuarioId
                                },

                                data: alteracoes,

                                select:
                                    selectConfiguracoes
                            });

                        if (passouASerMenorDe16) {
                            await parentalConsentService
                                .reativarAposCorrecaoNascimento(
                                    tx,
                                    usuarioId
                                )
                        }

                        return usuario
                    }
                )

            return {
                configuracoes:
                    formatarConfiguracoes(
                        usuarioAtualizado
                    ),

                consentimentoParentalNecessario:
                    passouASerMenorDe16
            }
        } catch (erro) {
            if (erro.code === 'P2002') {
                const erroEmail = new Error(
                    'Este e-mail já está em uso.'
                )

                erroEmail.status = 409;
                erroEmail.codigo =
                    'EMAIL_JA_CADASTRADO'

                throw erroEmail
            }

            throw erro
        }
    }

    // Função para alterar a senha do usuário
    async function alterarSenha({
        usuarioId,
        sessaoId,
        senhaAtual,
        novaSenha
    }) {
        const usuario =
            await prisma.usuario.findUnique({
                where: {
                    id: usuarioId
                },

                select: {
                    id: true,
                    senhaHash: true
                }
            })
        
        //A sessão atual precisa ser conhecida para que ela possa ser preservada com segurança
        if (
            !Number.isInteger(sessaoId)
            || sessaoId <= 0
        ) {
            const erro = new Error(
                'A sessão atual é inválida.'
            )

            erro.status = 401
            erro.codigo =
                'SESSAO_ATUAL_INVALIDA'

            throw erro
        }

        if (!usuario) {
            throw criarErroContaNaoEncontrada()
        }

        const senhaAtualCorreta =
            await passwordService.compararSenha(
                senhaAtual,
                usuario.senhaHash
            )

        if (!senhaAtualCorreta) {
            const erro = new Error(
                'A senha atual está incorreta.'
            )

            erro.status = 401;
            erro.codigo = 'SENHA_ATUAL_INCORRETA'

            throw erro
        }

        const novaSenhaEhIgual =
            await passwordService.compararSenha(
                novaSenha,
                usuario.senhaHash
            )

        if (novaSenhaEhIgual) {
            const erro = new Error(
                'A nova senha deve ser diferente da senha atual.'
            )

            erro.status = 422;
            erro.codigo = 'NOVA_SENHA_IGUAL_ATUAL'

            throw erro
        }

        const { senhaHash } =
            await passwordService.gerarHash(
                novaSenha
            )

        const momentoAtual = now()

        const outrasSessoesRevogadas =
            await prisma.$transaction(
                async function salvarNovaSenha(tx) {
                    //Atualiza somente se a senha não tiver sido alterada por outra requisição
                    const atualizacaoSenha =
                        await tx.usuario.updateMany({
                            where: {
                                id: usuarioId,
                                senhaHash:
                                    usuario.senhaHash
                            },

                            data: {
                                senhaHash
                            }
                        })

                    if (atualizacaoSenha.count !== 1) {
                        const erro = new Error(
                            'A senha foi alterada por outra sessão. Entre novamente e repita a operação.'
                        )

                        erro.status = 409
                        erro.codigo =
                            'SENHA_ALTERADA_CONCORRENTEMENTE'

                        throw erro
                    }

                    //A sessão usada para alterar a senha permanece ativa. Todas as demais são  encerradas imediatamente.
                    const sessoes =
                        await tx.sessao.updateMany({
                            where: {
                                usuarioId,

                                id: {
                                    not: sessaoId
                                },

                                revogadaEm: null
                            },

                            data: {
                                revogadaEm: momentoAtual
                            }
                        })

                    //Um link antigo de recuperação não pode substituir a senha recém-definida.
                    await tx.recuperacaoSenha.updateMany({
                        where: {
                            usuarioId,
                            statusLink: 'pendente'
                        },

                        data: {
                            statusLink: 'revogado'
                        }
                    })

                    return sessoes.count
                }
            )

        return {
            mensagem:
                'Senha atualizada com sucesso.',

            outrasSessoesEncerradas:
                outrasSessoesRevogadas
        }
    }

    return {
        buscarConfiguracoes,
        atualizarConfiguracoes,
        alterarSenha
    }
}

export { criarAccountService }