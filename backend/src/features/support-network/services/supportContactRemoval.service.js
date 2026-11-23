import {
    STATUS_CONTATO_ATIVO,
    STATUS_CONTATOS_LISTAVEIS
} from '../constants/supportContact.constants.js';
import { criarErro, validarTitular } from './supportContact.service.js';

function criarErroContatoNaoEncontrado() {
    return criarErro('Contato da Rede de Apoio não encontrado.', 404, 'CONTATO_NAO_ENCONTRADO');
}

function criarSupportContactRemovalService({ prisma, now = () => new Date() } = {}) {
    function validarDependencias(titularId, papel, contatoId) {
        validarTitular(titularId, papel);

        if (
            !Number.isSafeInteger(contatoId) ||
            contatoId <= 0 ||
            typeof prisma?.$transaction !== 'function' ||
            typeof now !== 'function'
        ) {
            throw new TypeError('Não foi possível remover o contato da Rede de Apoio.');
        }
    }

    async function aplicarRevogacaoDeAcesso(tx, vinculo, instante) {
        const sessoesEncerradas = 0;
        let alertasCancelados = 0;

        if (!vinculo.contatoId) {
            return { sessoesEncerradas, alertasCancelados };
        }

        // A sessão pertence à conta do contato, não a um vínculo específico.
        // Revogá-la aqui desconectaria a pessoa de todas as redes das quais participa.
        // O acesso a esta titular é encerrado pelo próprio status/remoção do vínculo.

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

        return { sessoesEncerradas, alertasCancelados };
    }

    async function remover({ titularId, papel, contatoId } = {}) {
        validarDependencias(titularId, papel, contatoId);

        return prisma.$transaction(async (tx) => {
            const instante = now();
            const vinculo = await tx.vinculoRedeApoio.findFirst({
                where: {
                    id: contatoId,
                    titularId,
                    status: { in: STATUS_CONTATOS_LISTAVEIS }
                },
                select: {
                    id: true,
                    contatoId: true,
                    status: true,
                    categoriaId: true
                }
            });
            if (!vinculo) throw criarErroContatoNaoEncontrado();
            if (vinculo.status === STATUS_CONTATO_ATIVO && !vinculo.contatoId) {
                throw criarErro(
                    'O vínculo ativo está inconsistente e não pode ser removido agora.',
                    409,
                    'VINCULO_INCONSISTENTE'
                );
            }

            const resultado = await tx.vinculoRedeApoio.deleteMany({
                where: {
                    id: vinculo.id,
                    titularId,
                    status: vinculo.status
                }
            });
            if (resultado.count !== 1) {
                throw criarErro(
                    'O contato foi alterado. Atualize a lista e tente novamente.',
                    409,
                    'CONTATO_ALTERADO'
                );
            }

            const { sessoesEncerradas, alertasCancelados } = await aplicarRevogacaoDeAcesso(
                tx,
                vinculo,
                instante
            );

            return Object.freeze({
                id: vinculo.id,
                status: 'removido',
                statusAnterior: vinculo.status,
                sessoesEncerradas,
                alertasCancelados
            });
        });
    }

    async function desativar({ titularId, papel, contatoId } = {}) {
        validarDependencias(titularId, papel, contatoId);

        return prisma.$transaction(async (tx) => {
            const instante = now();
            const vinculo = await tx.vinculoRedeApoio.findFirst({
                where: {
                    id: contatoId,
                    titularId,
                    status: STATUS_CONTATO_ATIVO
                },
                select: {
                    id: true,
                    contatoId: true,
                    status: true,
                    categoriaId: true
                }
            });

            if (!vinculo) throw criarErroContatoNaoEncontrado();
            if (!vinculo.contatoId) {
                throw criarErro(
                    'O vínculo ativo está inconsistente e não pode ser desativado agora.',
                    409,
                    'VINCULO_INCONSISTENTE'
                );
            }

            const resultado = await tx.vinculoRedeApoio.updateMany({
                where: {
                    id: vinculo.id,
                    titularId,
                    status: STATUS_CONTATO_ATIVO
                },
                data: {
                    status: 'revogado',
                    tokenConviteHash: null,
                    dataExpiracao: null,
                    dataResposta: instante
                }
            });

            if (resultado.count !== 1) {
                throw criarErro(
                    'O contato foi alterado. Atualize a lista e tente novamente.',
                    409,
                    'CONTATO_ALTERADO'
                );
            }

            const { sessoesEncerradas, alertasCancelados } = await aplicarRevogacaoDeAcesso(
                tx,
                vinculo,
                instante
            );

            return Object.freeze({
                id: vinculo.id,
                status: 'revogado',
                statusAnterior: vinculo.status,
                sessoesEncerradas,
                alertasCancelados
            });
        });
    }

    return Object.freeze({ desativar, remover });
}

export { criarErroContatoNaoEncontrado, criarSupportContactRemovalService };
