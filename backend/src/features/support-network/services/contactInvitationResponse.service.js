import { STATUS_CONVITE_PENDENTE } from '../constants/contactInvitation.constants.js';

function criarErroConviteIndisponivel() {
    const erro = new Error('Este convite não está mais disponível.');
    erro.status = 410;
    erro.codigo = 'CONVITE_INDISPONIVEL';
    return erro;
}

function criarContactInvitationResponseService({
    prisma,
    tokenService,
    passwordService,
    now = () => new Date()
} = {}) {
    if (
        typeof prisma?.vinculoRedeApoio?.findUnique !== 'function' ||
        typeof tokenService?.calcularHash !== 'function' ||
        typeof now !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar a resposta aos convites.');
    }

    async function buscarConvitePendente(token) {
        const tokenHash = tokenService.calcularHash(token);
        if (!tokenHash) throw criarErroConviteIndisponivel();

        const convite = await prisma.vinculoRedeApoio.findUnique({
            where: { tokenConviteHash: tokenHash },
            select: {
                id: true,
                titularId: true,
                emailConvidado: true,
                status: true,
                dataExpiracao: true,
                categoriaId: true,
                permissoesIndividuais: true,
                titular: { select: { nome: true } },
                categoria: {
                    select: { nome: true, conjuntoDadosVisiveis: true }
                }
            }
        });

        if (
            !convite ||
            convite.status !== STATUS_CONVITE_PENDENTE ||
            !(convite.dataExpiracao instanceof Date) ||
            convite.dataExpiracao <= now()
        ) {
            throw criarErroConviteIndisponivel();
        }

        return { convite, tokenHash };
    }

    async function consultar(token) {
        const { convite } = await buscarConvitePendente(token);
        const porCategoria = Boolean(convite.categoriaId && convite.categoria);

        return Object.freeze({
            titular: { nome: convite.titular.nome },
            tipoPermissao: porCategoria ? 'categoria' : 'individual',
            categoria: porCategoria
                ? {
                      nome: convite.categoria.nome,
                      permissoes: convite.categoria.conjuntoDadosVisiveis
                  }
                : null,
            permissoesIndividuais: porCategoria ? [] : convite.permissoesIndividuais,
            dataExpiracao: convite.dataExpiracao
        });
    }

    async function cadastrarContato(token, dados) {
        if (
            typeof passwordService?.gerarHash !== 'function' ||
            typeof prisma?.$transaction !== 'function'
        ) {
            throw new TypeError('Não foi possível configurar o cadastro de contato.');
        }
        const { convite, tokenHash } = await buscarConvitePendente(token);
        const { senhaHash } = await passwordService.gerarHash(dados.senha);

        try {
            const usuario = await prisma.$transaction(async (tx) => {
                const existente = await tx.usuario.findUnique({
                    where: { email: convite.emailConvidado },
                    select: { id: true }
                });
                if (existente) {
                    const erro = new Error('Já existe uma conta para este e-mail. Faça login.');
                    erro.status = 409;
                    erro.codigo = 'CONTA_JA_CADASTRADA';
                    throw erro;
                }

                const criado = await tx.usuario.create({
                    data: {
                        nome: dados.nome,
                        dataNascimento: dados.dataNascimento,
                        email: convite.emailConvidado,
                        emailConfirmadoEm: now(),
                        senhaHash,
                        papel: 'contato_apoio',
                        statusConta: 'ativa',
                        temaVisual: 'automatico'
                    },
                    select: { id: true, nome: true, email: true, papel: true }
                });

                const atualizado = await tx.vinculoRedeApoio.updateMany({
                    where: {
                        id: convite.id,
                        tokenConviteHash: tokenHash,
                        status: STATUS_CONVITE_PENDENTE,
                        contatoId: null,
                        dataExpiracao: { gt: now() }
                    },
                    data: { contatoId: criado.id }
                });
                if (atualizado.count !== 1) throw criarErroConviteIndisponivel();
                return criado;
            });

            return Object.freeze({
                usuario,
                mensagem: 'Conta criada com sucesso. Faça login para responder ao convite.'
            });
        } catch (erro) {
            if (erro?.code === 'P2002') {
                const conflito = new Error('Já existe uma conta para este e-mail. Faça login.');
                conflito.status = 409;
                conflito.codigo = 'CONTA_JA_CADASTRADA';
                throw conflito;
            }
            throw erro;
        }
    }

    async function buscarUsuarioDoConvite(tx, convite, usuarioId) {
        const usuario = await tx.usuario.findUnique({
            where: { id: usuarioId },
            select: { id: true, email: true, papel: true, statusConta: true }
        });
        if (
            !usuario ||
            usuario.statusConta !== 'ativa' ||
            usuario.email !== convite.emailConvidado
        ) {
            const erro = new Error('Este convite pertence a outra conta.');
            erro.status = 403;
            erro.codigo = 'CONVITE_DE_OUTRA_CONTA';
            throw erro;
        }
        return usuario;
    }

    async function aceitar({ token, usuarioId }) {
        if (typeof prisma?.$transaction !== 'function') {
            throw new TypeError('Não foi possível aceitar o convite.');
        }
        const { convite, tokenHash } = await buscarConvitePendente(token);

        return prisma.$transaction(async (tx) => {
            const usuario = await buscarUsuarioDoConvite(tx, convite, usuarioId);

            const papel =
                usuario.papel === 'principal' ? 'principal_e_contato_apoio' : usuario.papel;
            if (!['contato_apoio', 'principal_e_contato_apoio'].includes(papel)) {
                throw criarErroConviteIndisponivel();
            }

            if (papel !== usuario.papel) {
                await tx.usuario.update({
                    where: { id: usuario.id },
                    data: { papel }
                });
            }

            const atualizado = await tx.vinculoRedeApoio.updateMany({
                where: {
                    id: convite.id,
                    tokenConviteHash: tokenHash,
                    emailConvidado: usuario.email,
                    status: STATUS_CONVITE_PENDENTE,
                    dataExpiracao: { gt: now() }
                },
                data: {
                    contatoId: usuario.id,
                    status: 'ativo',
                    tokenConviteHash: null,
                    dataResposta: now()
                }
            });
            if (atualizado.count !== 1) throw criarErroConviteIndisponivel();

            await tx.notificacao.create({
                data: {
                    usuarioId: convite.titularId,
                    tipoOrigem: 'rede_apoio',
                    origemId: convite.id,
                    dataHoraProgramada: now(),
                    statusEnvio: 'agendada'
                }
            });

            return Object.freeze({
                status: 'ativo',
                mensagem: 'Convite aceito com sucesso.'
            });
        });
    }

    async function recusar({ token, usuarioId }) {
        if (typeof prisma?.$transaction !== 'function') {
            throw new TypeError('Não foi possível recusar o convite.');
        }
        const { convite, tokenHash } = await buscarConvitePendente(token);

        return prisma.$transaction(async (tx) => {
            const usuario = await buscarUsuarioDoConvite(tx, convite, usuarioId);
            const atualizado = await tx.vinculoRedeApoio.updateMany({
                where: {
                    id: convite.id,
                    tokenConviteHash: tokenHash,
                    emailConvidado: usuario.email,
                    status: STATUS_CONVITE_PENDENTE,
                    dataExpiracao: { gt: now() }
                },
                data: {
                    contatoId: usuario.id,
                    status: 'recusado',
                    tokenConviteHash: null,
                    dataResposta: now()
                }
            });
            if (atualizado.count !== 1) throw criarErroConviteIndisponivel();

            await tx.notificacao.create({
                data: {
                    usuarioId: convite.titularId,
                    tipoOrigem: 'rede_apoio',
                    origemId: convite.id,
                    dataHoraProgramada: now(),
                    statusEnvio: 'agendada'
                }
            });

            return Object.freeze({
                status: 'recusado',
                mensagem: 'Convite recusado com sucesso.'
            });
        });
    }

    return Object.freeze({
        aceitar,
        buscarConvitePendente,
        cadastrarContato,
        consultar,
        recusar
    });
}

export { criarContactInvitationResponseService, criarErroConviteIndisponivel };
