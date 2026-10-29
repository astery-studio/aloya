import { AppError } from '../../../shared/errors/AppError.js';
import { diferencaDias, formatarData } from '../utils/calendar.js';

const SELECAO_CICLO = Object.freeze({
    id: true,
    dataInicio: true,
    dataFim: true,
    atualizadoEm: true,
    diasMenstruacao: {
        orderBy: { data: 'asc' },
        select: { id: true, data: true }
    }
});

function criarErroNaoEncontrado() {
    return new AppError('Registro de menstruação não encontrado.', 404, 'CICLO_NAO_ENCONTRADO');
}

function criarErroConcorrencia() {
    return new AppError(
        'O registro foi alterado em outra operação. Atualize os dados e tente novamente.',
        409,
        'CONFLITO_REMOCAO_CICLO'
    );
}

function validarPrisma(prisma) {
    const possuiCiclo =
        typeof prisma?.registroCiclo?.findFirst === 'function' &&
        typeof prisma.registroCiclo.deleteMany === 'function' &&
        typeof prisma.registroCiclo.findMany === 'function' &&
        typeof prisma.registroCiclo.update === 'function' &&
        typeof prisma.registroCiclo.updateMany === 'function' &&
        typeof prisma.registroCiclo.count === 'function';
    const possuiDia = typeof prisma?.diaMenstruacao?.deleteMany === 'function';
    const possuiPrevisao = typeof prisma?.previsao?.deleteMany === 'function';

    if (
        typeof prisma?.$transaction !== 'function' ||
        !possuiCiclo ||
        !possuiDia ||
        !possuiPrevisao
    ) {
        throw new TypeError('O Prisma da remoção de ciclos é inválido.');
    }
}

async function recalcularCiclos(tx, usuarioId) {
    const ciclos = await tx.registroCiclo.findMany({
        where: { usuarioId },
        orderBy: [{ dataInicio: 'asc' }, { id: 'asc' }],
        select: { id: true, dataInicio: true, duracaoCiclo: true, ehCicloInicial: true }
    });

    if (!Array.isArray(ciclos)) {
        throw new TypeError('O histórico de ciclos retornou dados inválidos.');
    }

    for (const [indice, ciclo] of ciclos.entries()) {
        const anterior = ciclos[indice - 1];
        const duracaoCiclo = anterior ? diferencaDias(anterior.dataInicio, ciclo.dataInicio) : null;
        const ehCicloInicial = indice === 0;

        if (ciclo.duracaoCiclo !== duracaoCiclo || ciclo.ehCicloInicial !== ehCicloInicial) {
            await tx.registroCiclo.update({
                where: { id: ciclo.id },
                data: { duracaoCiclo, ehCicloInicial }
            });
        }
    }
}

async function limparPrevisoes(tx, usuarioId) {
    await tx.previsao.deleteMany({ where: { usuarioId } });
    const quantidadeCiclos = await tx.registroCiclo.count({ where: { usuarioId } });

    if (!Number.isSafeInteger(quantidadeCiclos) || quantidadeCiclos < 0) {
        throw new TypeError('A contagem de ciclos retornou dados inválidos.');
    }

    return quantidadeCiclos;
}

function criarCycleRemovalRepository({ prisma } = {}) {
    validarPrisma(prisma);

    async function buscarCiclo(tx, usuarioId, cicloId) {
        const ciclo = await tx.registroCiclo.findFirst({
            where: { id: cicloId, usuarioId },
            select: SELECAO_CICLO
        });

        if (!ciclo || !Array.isArray(ciclo.diasMenstruacao)) {
            throw criarErroNaoEncontrado();
        }

        return ciclo;
    }

    async function removerDia({ usuarioId, cicloId, data }) {
        return prisma.$transaction(async (tx) => {
            const ciclo = await buscarCiclo(tx, usuarioId, cicloId);
            const dataTexto = formatarData(data);
            const dia = ciclo.diasMenstruacao.find((item) => formatarData(item.data) === dataTexto);

            if (!dia) {
                throw criarErroNaoEncontrado();
            }

            const diasRestantes = ciclo.diasMenstruacao.filter((item) => item.id !== dia.id);
            let cicloRemovido = false;

            if (diasRestantes.length === 0) {
                const removido = await tx.registroCiclo.deleteMany({
                    where: { id: cicloId, usuarioId, atualizadoEm: ciclo.atualizadoEm }
                });

                if (removido.count !== 1) {
                    throw criarErroConcorrencia();
                }

                cicloRemovido = true;
            } else {
                const removido = await tx.diaMenstruacao.deleteMany({
                    where: { id: dia.id, registroCicloId: cicloId }
                });

                if (removido.count !== 1) {
                    throw criarErroConcorrencia();
                }

                const dataInicio = diasRestantes[0].data;
                const dataFim = ciclo.dataFim === null ? null : diasRestantes.at(-1).data;
                const duracaoMenstruacao = dataFim ? diferencaDias(dataInicio, dataFim) + 1 : null;
                const atualizado = await tx.registroCiclo.updateMany({
                    where: { id: cicloId, usuarioId, atualizadoEm: ciclo.atualizadoEm },
                    data: { dataInicio, dataFim, duracaoMenstruacao }
                });

                if (atualizado.count !== 1) {
                    throw criarErroConcorrencia();
                }
            }

            await recalcularCiclos(tx, usuarioId);
            const quantidadeCiclos = await limparPrevisoes(tx, usuarioId);

            return { cicloRemovido, quantidadeCiclos };
        });
    }

    async function excluirCiclo({ usuarioId, cicloId }) {
        return prisma.$transaction(async (tx) => {
            const ciclo = await tx.registroCiclo.findFirst({
                where: { id: cicloId, usuarioId },
                select: { id: true, atualizadoEm: true }
            });

            if (!ciclo) {
                throw criarErroNaoEncontrado();
            }

            const removido = await tx.registroCiclo.deleteMany({
                where: { id: cicloId, usuarioId, atualizadoEm: ciclo.atualizadoEm }
            });

            if (removido.count !== 1) {
                throw criarErroConcorrencia();
            }

            await recalcularCiclos(tx, usuarioId);
            const quantidadeCiclos = await limparPrevisoes(tx, usuarioId);

            return { cicloRemovido: true, quantidadeCiclos };
        });
    }

    return Object.freeze({ removerDia, excluirCiclo });
}

export { criarCycleRemovalRepository };
