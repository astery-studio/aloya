import { STATUS_CONTATO_PENDENTE } from '../constants/supportContact.constants.js';
import { criarErro, validarTitular } from './supportContact.service.js';

function criarContactInvitationResendService({
    prisma,
    tokenService,
    emailService,
    now = () => new Date()
} = {}) {
    async function reenviar({ titularId, papel, contatoId } = {}) {
        validarTitular(titularId, papel);

        if (
            !Number.isSafeInteger(contatoId) ||
            contatoId <= 0 ||
            typeof prisma?.vinculoRedeApoio?.findFirst !== 'function' ||
            typeof prisma?.vinculoRedeApoio?.updateMany !== 'function' ||
            typeof prisma?.notificacao?.create !== 'function' ||
            typeof tokenService?.emitir !== 'function' ||
            typeof emailService?.enviarConviteRedeApoio !== 'function' ||
            typeof now !== 'function'
        ) {
            throw new TypeError('Não foi possível reenviar o convite de contato.');
        }

        const convite = await prisma.vinculoRedeApoio.findFirst({
            where: {
                id: contatoId,
                titularId,
                status: STATUS_CONTATO_PENDENTE
            },
            select: {
                id: true,
                contatoId: true,
                emailConvidado: true,
                tokenConviteHash: true,
                dataEnvio: true,
                dataExpiracao: true,
                titular: {
                    select: {
                        nome: true
                    }
                }
            }
        });

        if (!convite) {
            throw criarErro(
                'Este convite não está mais disponível para reenvio.',
                409,
                'CONVITE_NAO_DISPONIVEL'
            );
        }

        const credencial = tokenService.emitir();
        const dataEnvio = now();
        const atualizacao = await prisma.vinculoRedeApoio.updateMany({
            where: {
                id: convite.id,
                titularId,
                status: STATUS_CONTATO_PENDENTE,
                tokenConviteHash: convite.tokenConviteHash
            },
            data: {
                tokenConviteHash: credencial.tokenHash,
                dataEnvio,
                dataExpiracao: credencial.dataExpiracao
            }
        });

        if (atualizacao.count !== 1) {
            throw criarErro(
                'Este convite foi alterado e não pode ser reenviado agora.',
                409,
                'CONVITE_ALTERADO'
            );
        }

        try {
            if (convite.contatoId) {
                await prisma.notificacao.create({
                    data: {
                        usuarioId: convite.contatoId,
                        tipoOrigem: 'rede_apoio',
                        origemId: convite.id,
                        dataHoraProgramada: dataEnvio,
                        statusEnvio: 'agendada'
                    }
                });
            } else {
                await emailService.enviarConviteRedeApoio({
                    email: convite.emailConvidado,
                    nomeTitular: convite.titular.nome,
                    linkConvite: credencial.link,
                    requerCadastro: true
                });
            }
        } catch (erro) {
            try {
                await prisma.vinculoRedeApoio.updateMany({
                    where: {
                        id: convite.id,
                        titularId,
                        status: STATUS_CONTATO_PENDENTE,
                        tokenConviteHash: credencial.tokenHash
                    },
                    data: {
                        tokenConviteHash: convite.tokenConviteHash,
                        dataEnvio: convite.dataEnvio,
                        dataExpiracao: convite.dataExpiracao
                    }
                });
            } catch {
                // A falha original do envio é preservada; o log central receberá o erro.
            }
            throw erro;
        }

        return Object.freeze({
            id: convite.id,
            email: convite.emailConvidado,
            status: STATUS_CONTATO_PENDENTE,
            dataEnvio,
            dataExpiracao: credencial.dataExpiracao
        });
    }

    return Object.freeze({ reenviar });
}

export { criarContactInvitationResendService };
