import { AppError } from '../../../shared/errors/AppError.js';
import { diferencaDias, formatarData } from '../utils/calendar.js';

const SELECAO_CICLO = Object.freeze({
    id: true,
    dataInicio: true,
    dataFim: true,
    atualizadoEm: true
});

function calcularDuracaoMenstruacao(inicio, fim) {
    return fim ? diferencaDias(inicio, fim) + 1 : null;
}

function criarErroDatas() {
    return new AppError(
        'A data de início não pode ser posterior à data de término.',
        422,
        'ORDEM_DATAS_CICLO_INVALIDA'
    );
}

function criarCycleEditService({ prisma } = {}) {
    if (!prisma || typeof prisma.$transaction !== 'function') {
        throw new TypeError('O Prisma da edição de ciclos é inválido.');
    }

    async function buscar({ usuarioId, cicloId }) {
        const ciclo = await prisma.registroCiclo.findFirst({
            where: { id: cicloId, usuarioId },
            select: {
                id: true,
                dataInicio: true,
                dataFim: true,
                duracaoMenstruacao: true,
                duracaoCiclo: true
            }
        });

        if (!ciclo) {
            throw new AppError(
                'Registro de menstruação não encontrado.',
                404,
                'CICLO_NAO_ENCONTRADO'
            );
        }

        return {
            ...ciclo,
            dataInicio: formatarData(ciclo.dataInicio),
            dataFim: ciclo.dataFim ? formatarData(ciclo.dataFim) : null
        };
    }

    async function editar({ usuarioId, cicloId, dados }) {
        return prisma.$transaction(async (tx) => {
            const atual = await tx.registroCiclo.findFirst({
                where: { id: cicloId, usuarioId },
                select: SELECAO_CICLO
            });

            if (!atual) {
                throw new AppError(
                    'Registro de menstruação não encontrado.',
                    404,
                    'CICLO_NAO_ENCONTRADO'
                );
            }

            const dataInicio = dados.dataInicio ?? atual.dataInicio;
            const dataFim = Object.hasOwn(dados, 'dataFim') ? dados.dataFim : atual.dataFim;

            if (dataFim && dataInicio > dataFim) {
                throw criarErroDatas();
            }

            if (
                dataInicio.getTime() === atual.dataInicio.getTime() &&
                (dataFim?.getTime() ?? null) === (atual.dataFim?.getTime() ?? null)
            ) {
                throw new AppError('Nenhuma alteração foi identificada.', 422, 'NENHUMA_ALTERACAO');
            }

            const conflito = await tx.registroCiclo.findFirst({
                where: {
                    usuarioId,
                    id: { not: cicloId },
                    ...(dataFim ? { dataInicio: { lte: dataFim } } : {}),
                    OR: [{ dataFim: null }, { dataFim: { gte: dataInicio } }]
                },
                orderBy: { dataInicio: 'asc' },
                select: { dataInicio: true, dataFim: true }
            });

            if (conflito) {
                const inicio = formatarData(conflito.dataInicio);
                const fim = conflito.dataFim ? formatarData(conflito.dataFim) : 'em andamento';
                const falha = new AppError(
                    `O período informado se sobrepõe ao ciclo de ${inicio} a ${fim}.`,
                    409,
                    'SOBREPOSICAO_CICLO'
                );
                falha.conflito = { dataInicio: inicio, dataFim: conflito.dataFim ? fim : null };
                throw falha;
            }

            const atualizacao = await tx.registroCiclo.updateMany({
                where: { id: cicloId, usuarioId, atualizadoEm: atual.atualizadoEm },
                data: {
                    dataInicio,
                    dataFim,
                    duracaoMenstruacao: calcularDuracaoMenstruacao(dataInicio, dataFim)
                }
            });

            if (atualizacao.count !== 1) {
                throw new AppError(
                    'O registro foi alterado em outra operação. Atualize os dados e tente novamente.',
                    409,
                    'CONFLITO_EDICAO_CICLO'
                );
            }

            await tx.diaMenstruacao.deleteMany({ where: { registroCicloId: cicloId } });

            const quantidadeDias = dataFim ? diferencaDias(dataInicio, dataFim) + 1 : 1;
            await tx.diaMenstruacao.createMany({
                data: Array.from({ length: quantidadeDias }, (_, indice) => ({
                    registroCicloId: cicloId,
                    data: new Date(dataInicio.getTime() + indice * 86_400_000)
                }))
            });

            const ciclos = await tx.registroCiclo.findMany({
                where: { usuarioId },
                orderBy: [{ dataInicio: 'asc' }, { id: 'asc' }],
                select: {
                    id: true,
                    dataInicio: true,
                    duracaoCiclo: true,
                    ehCicloInicial: true
                }
            });

            for (const [indice, ciclo] of ciclos.entries()) {
                const anterior = ciclos[indice - 1];
                const duracaoCiclo = anterior
                    ? diferencaDias(anterior.dataInicio, ciclo.dataInicio)
                    : null;
                const ehCicloInicial = indice === 0;

                if (
                    ciclo.duracaoCiclo === duracaoCiclo &&
                    ciclo.ehCicloInicial === ehCicloInicial
                ) {
                    continue;
                }

                await tx.registroCiclo.update({
                    where: { id: ciclo.id },
                    data: {
                        duracaoCiclo,
                        ehCicloInicial
                    }
                });
            }

            await tx.previsao.deleteMany({ where: { usuarioId } });

            const editado = await tx.registroCiclo.findUnique({
                where: { id: cicloId },
                select: {
                    id: true,
                    dataInicio: true,
                    dataFim: true,
                    duracaoMenstruacao: true,
                    duracaoCiclo: true
                }
            });


