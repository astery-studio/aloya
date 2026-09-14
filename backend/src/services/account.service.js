function criarAccountService({
    prisma,
    passwordService,
    parentalConsentService,
    dateUtils,
    now = () => new Date()
}) {
    const selectConfiguracoes = {
        id: true,
        nome: true,
        email: true,
        genero: true,
        dataNascimento: true,
        atualizadoEm: true
    };

    function criarErroContaNaoEncontrada() {
        const erro = new Error(
            'Conta não encontrada.'
        );

        erro.status = 404;
        erro.codigo = 'CONTA_NAO_ENCONTRADA';

        return erro;
    }

    function formatarData(data) {
        return data.toISOString().slice(0, 10);
    }

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
        };
    }

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
        );
    }

    async function buscarConfiguracoes(usuarioId) {
        const usuario =
            await prisma.usuario.findUnique({
                where: {
                    id: usuarioId
                },

                select: selectConfiguracoes
            });

        if (!usuario) {
            throw criarErroContaNaoEncontrada();
        }

        return formatarConfiguracoes(usuario);
    }

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
            });

        if (
            usuarioComEmail
            && usuarioComEmail.id !== usuarioId
        ) {
            const erro = new Error(
                'Este e-mail já está em uso.'
            );

            erro.status = 409;
            erro.codigo = 'EMAIL_JA_CADASTRADO';

            throw erro;
        }
    }

    function identificarAlteracoes(
        usuarioAtual,
        dados
    ) {
        const alteracoes = {};

        if (
            dados.nome !== undefined
            && dados.nome !== usuarioAtual.nome
        ) {
            alteracoes.nome = dados.nome;
        }

        if (
            dados.email !== undefined
            && dados.email !== usuarioAtual.email
        ) {
            alteracoes.email = dados.email;
        }

        if (
            dados.identidadeGenero !== undefined
            && dados.identidadeGenero
                !== usuarioAtual.genero
        ) {
            alteracoes.genero =
                dados.identidadeGenero;
        }

        if (
            dados.dataNascimento !== undefined
            && !datasSaoIguais(
                usuarioAtual.dataNascimento,
                dados.dataNascimento
            )
        ) {
            alteracoes.dataNascimento =
                dados.dataNascimento;
        }

        return alteracoes;
    }

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
            });

        if (!usuarioAtual) {
            throw criarErroContaNaoEncontrada();
        }

        const alteracoes = identificarAlteracoes(
            usuarioAtual,
            dados
        );

        if (Object.keys(alteracoes).length === 0) {
            const erro = new Error(
                'Nenhuma alteração foi identificada.'
            );

            erro.status = 422;
            erro.codigo = 'NENHUMA_ALTERACAO';

            throw erro;
        }

        if (alteracoes.email !== undefined) {
            await verificarEmailDisponivel(
                usuarioId,
                alteracoes.email
            );
        }

        const momentoAtual = now();

        const idadeAnterior =
            dateUtils.calcularIdade(
                usuarioAtual.dataNascimento,
                momentoAtual
            );

        const dataNascimentoAtualizada =
            alteracoes.dataNascimento
            || usuarioAtual.dataNascimento;

        const idadeAtualizada =
            dateUtils.calcularIdade(
                dataNascimentoAtualizada,
                momentoAtual
            );

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
                                );
                        }

                        return usuario;
                    }
                );

            return {
                configuracoes:
                    formatarConfiguracoes(
                        usuarioAtualizado
                    ),

                consentimentoParentalNecessario:
                    passouASerMenorDe16
            };
        } catch (erro) {
            /*
             * A consulta prévia melhora a mensagem,
             * mas o P2002 ainda deve ser tratado para
             * impedir condição de corrida.
             */
            if (erro.code === 'P2002') {
                const erroEmail = new Error(
                    'Este e-mail já está em uso.'
                );

                erroEmail.status = 409;
                erroEmail.codigo =
                    'EMAIL_JA_CADASTRADO';

                throw erroEmail;
            }

            throw erro;
        }
    }

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
            });

        if (!usuario) {
            throw criarErroContaNaoEncontrada();
        }

        const senhaAtualCorreta =
            await passwordService.compararSenha(
                senhaAtual,
                usuario.senhaHash
            );

        if (!senhaAtualCorreta) {
            const erro = new Error(
                'A senha atual está incorreta.'
            );

            erro.status = 401;
            erro.codigo = 'SENHA_ATUAL_INCORRETA';

            throw erro;
        }

        const novaSenhaEhIgual =
            await passwordService.compararSenha(
                novaSenha,
                usuario.senhaHash
            );

        if (novaSenhaEhIgual) {
            const erro = new Error(
                'A nova senha deve ser diferente da senha atual.'
            );

            erro.status = 422;
            erro.codigo = 'NOVA_SENHA_IGUAL_ATUAL';

            throw erro;
        }

        const { senhaHash } =
            await passwordService.gerarHash(
                novaSenha
            );

        const momentoAtual = now();

        const outrasSessoesRevogadas =
            await prisma.$transaction(
                async function salvarNovaSenha(tx) {
                    await tx.usuario.update({
                        where: {
                            id: usuarioId
                        },

                        data: {
                            senhaHash
                        }
                    });

                    /*
                     * A sessão usada para alterar a senha
                     * permanece ativa. Todas as demais são
                     * encerradas imediatamente.
                     */
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
                        });

                    /*
                     * Um link antigo de recuperação não pode
                     * substituir a senha recém-definida.
                     */
                    await tx.recuperacaoSenha.updateMany({
                        where: {
                            usuarioId,
                            statusLink: 'pendente'
                        },

                        data: {
                            statusLink: 'revogado'
                        }
                    });

                    return sessoes.count;
                }
            );

        return {
            mensagem:
                'Senha atualizada com sucesso.',

            outrasSessoesEncerradas:
                outrasSessoesRevogadas
        };
    }

    return {
        buscarConfiguracoes,
        atualizarConfiguracoes,
        alterarSenha
    };
}

module.exports = {
    criarAccountService
};