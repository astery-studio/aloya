import {
    papelEhTitular,
    STATUS_CONVITE_PENDENTE,
    STATUS_VINCULO_ATIVO,
    usuarioEhContatoCadastrado
} from '../constants/contactInvitation.constants.js';
import {
    corContatoEhValida,
    iconeContatoEhValido
} from '../constants/contactAppearance.constants.js';

function criarErro(mensagem, status, codigo) {
    const erro = new Error(mensagem);

    erro.status = status;
    erro.codigo = codigo;

    return erro;
}

function validarTitular(titularId, papel) {
    if (!Number.isSafeInteger(titularId) || titularId <= 0) {
        throw criarErro('Sessão inválida.', 401, 'SESSAO_INVALIDA');
    }

    if (!papelEhTitular(papel)) {
        throw criarErro(
            'Somente a titular pode convidar contatos para a Rede de Apoio.',
            403,
            'ACESSO_NEGADO'
        );
    }
}

function validarAparenciaContato(iconeId, corId) {
    if (!iconeContatoEhValido(iconeId) || !corContatoEhValida(corId)) {
        throw criarErro(
            'A aparência selecionada para o contato é inválida.',
            422,
            'APARENCIA_CONTATO_INVALIDA'
        );
    }

    return Object.freeze({
        iconeId,
        corId
    });
}

function formatarConvite(convite, permissao) {
    const categoria =
        permissao.tipo === 'categoria'
            ? Object.freeze({
                  id: permissao.categoriaId,
                  nome: permissao.categoriaNome
              })
            : null;

    const permissoesIndividuais =
        permissao.tipo === 'individual'
            ? Object.freeze([...permissao.permissoesIndividuais])
            : Object.freeze([]);

    return Object.freeze({
        id: convite.id,
        email: convite.emailConvidado,
        status: convite.status,
        iconeId: convite.iconeId,
        corId: convite.corId,
        tipoPermissao: permissao.tipo,
        categoria,
        permissoesIndividuais,
        dataEnvio: convite.dataEnvio,
        dataExpiracao: convite.dataExpiracao
    });
}

function criarContactInvitationService({
    prisma,
    permissionService,
    tokenService,
    emailService
} = {}) {
    async function consultarEmail({ titularId, papel, email } = {}) {
        validarTitular(titularId, papel);

        if (typeof prisma?.usuario?.findUnique !== 'function') {
            throw new TypeError('Não foi possível consultar o contato.');
        }

        const usuario = await prisma.usuario.findUnique({
            where: { email },
            select: {
                id: true,
                papel: true,
                statusConta: true
            }
        });

        const contaContatoCadastrada =
            usuario?.id !== titularId && usuarioEhContatoCadastrado(usuario);

        return Object.freeze({
            email,
            contaContatoCadastrada
        });
    }

    async function criarConvite({
        titularId,
        papel,
        email,
        categoriaId,
        permissoesIndividuais,
        iconeId,
        corId
    } = {}) {
        validarTitular(titularId, papel);

        const aparencia = validarAparenciaContato(iconeId, corId);

        if (
            typeof prisma?.usuario?.findUnique !== 'function' ||
            typeof prisma?.vinculoRedeApoio?.findFirst !== 'function' ||
            typeof prisma?.vinculoRedeApoio?.create !== 'function' ||
            typeof prisma?.vinculoRedeApoio?.deleteMany !== 'function' ||
            typeof prisma?.notificacao?.create !== 'function' ||
            typeof permissionService?.resolverCategoria !== 'function' ||
            typeof permissionService?.resolverPermissoesIndividuais !== 'function' ||
            typeof tokenService?.emitir !== 'function' ||
            typeof emailService?.enviarConviteRedeApoio !== 'function'
        ) {
            throw new TypeError('Não foi possível criar o convite de contato.');
        }

        const titular = await prisma.usuario.findUnique({
            where: {
                id: titularId
            },
            select: {
                id: true,
                nome: true,
                email: true
            }
        });

        if (!titular) {
            throw criarErro('Sessão inválida.', 401, 'SESSAO_INVALIDA');
        }

        if (titular.email === email) {
            throw criarErro(
                'Você não pode convidar seu próprio e-mail.',
                422,
                'CONVITE_PARA_PROPRIA_CONTA'
            );
        }

        const [usuarioConvidado, vinculoExistente] = await Promise.all([
            prisma.usuario.findUnique({
                where: {
                    email
                },
                select: {
                    id: true,
                    papel: true,
                    statusConta: true
                }
            }),

            prisma.vinculoRedeApoio.findFirst({
                where: {
                    titularId,
                    emailConvidado: email,
                    status: {
                        in: [STATUS_CONVITE_PENDENTE, STATUS_VINCULO_ATIVO]
                    }
                },
                select: {
                    status: true
                }
            })
        ]);

        if (vinculoExistente) {
            const pendente = vinculoExistente.status === STATUS_CONVITE_PENDENTE;

            throw criarErro(
                pendente
                    ? 'Já existe um convite pendente para este e-mail.'
                    : 'Este contato já faz parte da sua Rede de Apoio.',
                409,
                pendente ? 'CONVITE_JA_PENDENTE' : 'CONTATO_JA_VINCULADO'
            );
        }

        const permissao = categoriaId
            ? await permissionService.resolverCategoria({
                  titularId,
                  categoriaId
              })
            : permissionService.resolverPermissoesIndividuais(permissoesIndividuais);

        const contaContatoCadastrada = usuarioEhContatoCadastrado(usuarioConvidado);

        const credencial = tokenService.emitir();

        let convite;

        try {
            convite = await prisma.vinculoRedeApoio.create({
                data: {
                    titularId,
                    contatoId: contaContatoCadastrada ? usuarioConvidado.id : null,
                    emailConvidado: email,
                    categoriaId: permissao.categoriaId,
                    permissoesIndividuais: permissao.permissoesIndividuais,
                    iconeId: aparencia.iconeId,
                    corId: aparencia.corId,
                    status: STATUS_CONVITE_PENDENTE,
                    tokenConviteHash: credencial.tokenHash,
                    dataExpiracao: credencial.dataExpiracao
                },
                select: {
                    id: true,
                    emailConvidado: true,
                    iconeId: true,
                    corId: true,
                    status: true,
                    dataEnvio: true,
                    dataExpiracao: true
                }
            });
        } catch (erro) {
            if (erro?.code === 'P2002') {
                throw criarErro(
                    'Já existe um convite pendente para este e-mail.',
                    409,
                    'CONVITE_JA_PENDENTE'
                );
            }

            throw erro;
        }

        try {
            if (contaContatoCadastrada) {
                await prisma.notificacao.create({
                    data: {
                        usuarioId: usuarioConvidado.id,
                        tipoOrigem: 'rede_apoio',
                        origemId: convite.id,
                        dataHoraProgramada: convite.dataEnvio,
                        statusEnvio: 'agendada'
                    }
                });
            } else {
                await emailService.enviarConviteRedeApoio({
                    email,
                    nomeTitular: titular.nome,
                    linkConvite: credencial.link,
                    requerCadastro: true
                });
            }
        } catch (erro) {
            await prisma.vinculoRedeApoio.deleteMany({
                where: {
                    id: convite.id,
                    titularId,
                    status: STATUS_CONVITE_PENDENTE,
                    tokenConviteHash: credencial.tokenHash
                }
            });

            throw erro;
        }

        return formatarConvite(convite, permissao);
    }

    return Object.freeze({
        consultarEmail,
        criarConvite
    });
}

export {
    criarContactInvitationService,
    criarErro,
    formatarConvite,
    validarAparenciaContato,
    validarTitular
};
