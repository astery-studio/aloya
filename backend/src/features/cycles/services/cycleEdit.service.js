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

