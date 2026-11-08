import { STATUS_CONTATOS_VISIVEIS } from '../constants/supportContact.constants.js';
import { criarErro, validarTitular } from './supportContact.service.js';

function criarErroContatoNaoEncontrado() {
    return criarErro(
        'Contato da Rede de Apoio não encontrado.',
        404,
        'CONTATO_NAO_ENCONTRADO'
    );
}

function criarSupportContactRemovalService({ prisma, now = () => new Date() } = {}) {
    async function remover({ titularId, papel, contatoId } = {}) {
        validarTitular(titularId, papel);
        if (
            !Number.isSafeInteger(contatoId) ||
            contatoId <= 0 ||
            typeof prisma?.$transaction !== 'function' ||
            typeof now !== 'function'
        ) {
            throw new TypeError('Não foi possível remover o contato da Rede de Apoio.');
        }

        return prisma.$transaction(async (tx) => {
            const instante = now();
            const vinculo = await tx.vinculoRedeApoio.findFirst({
                where: {
                    id: contatoId,
                    titularId,
                    status: { in: STATUS_CONTATOS_VISIVEIS }
                },
                select: {
                    id: true,
                    contatoId: true,
                    status: true,
                    categoriaId: true
                }
            });
            if (!vinculo) throw criarErroContatoNaoEncontrado();
            if (vinculo.status === 'ativo' && !vinculo.contatoId) {
                throw criarErro(
                    'O vínculo ativo está inconsistente e não pode ser removido agora.',
                    409,
                    'VINCULO_INCONSISTENTE'
                );
            }

            const resultado = await tx.vinculoRedeApoio.updateMany({
                where: {
                    id: vinculo.id,
                    titularId,
                    status: vinculo.status
                },
                data: {
                    status: 'revogado',
                    categoriaId: null,
                    permissoesIndividuais: [],
                    tokenConviteHash: null,
                    dataExpiracao: null,
                    ...(vinculo.status === 'pendente' ? { dataResposta: instante } : {})
                }
            });
            if (resultado.count !== 1) {
                throw criarErro(
                    'O contato foi alterado. Atualize a lista e tente novamente.',
                    409,
                    'CONTATO_ALTERADO'
                );
            }

            let sessoesEncerradas = 0;
            let alertasCancelados = 0;
            if (vinculo.contatoId) {
                if (vinculo.status === 'ativo') {
                    const sessoes = await tx.sessao.updateMany({
                        where: {
                            usuarioId: vinculo.contatoId,
                            revogadaEm: null,
                            validadeSessao: { gt: instante }
                        },
                        data: { revogadaEm: instante }
                    });
                    sessoesEncerradas = sessoes.count;
                }

                const alertas = await tx.notificacao.updateMany({
                    where: {
                        usuarioId: vinculo.contatoId,
                        tipoOrigem: 'rede_apoio',
                        origemId: vinculo.id,
                        statusEnvio: 'agendada'
                    },
                    data: { statusEnvio: 'cancelada' }
                });
                alertasCancelados = alertas.count;

                await tx.notificacao.create({
                    data: {
                        usuarioId: vinculo.contatoId,
                        tipoOrigem: 'rede_apoio',
                        origemId: vinculo.id,
                        dataHoraProgramada: instante,
                        statusEnvio: 'agendada'
                    }
                });
            }

            return Object.freeze({
                id: vinculo.id,
                status: 'revogado',
                sessoesEncerradas,
                alertasCancelados
            });
        });
    }

    return Object.freeze({ remover });
}

export { criarErroContatoNaoEncontrado, criarSupportContactRemovalService };
