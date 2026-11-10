import { agruparDias } from '../utils/cycleContinuity.js';
import { prepararUniao, excluirCiclosUnidos } from './cycleMerge.service.js';
import {
    prepararDiasOutrosCiclos,
    restaurarDiasOutrosCiclos
} from './cycleEditAffectedCycles.service.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { formatarData } from '../utils/calendar.js';
import { recalcularCiclos, limparPrevisoes } from '../repositories/cycleRemoval.repository.js';

async function editarDiasDoCiclo({
    prisma,
    usuarioId,
    cicloId,
    dias,
    confirmarOutrosCiclos = false
}) {
    return prisma.$transaction(async (tx) => {
        const atual = await tx.registroCiclo.findFirst({
            where: { id: cicloId, usuarioId },
            include: { diasMenstruacao: { orderBy: { data: 'asc' } } }
        });
        if (!atual)
            throw new AppError(
                'Registro de menstruação não encontrado.',
                404,
                'CICLO_NAO_ENCONTRADO'
            );
        if (
            JSON.stringify(dias.map(formatarData)) ===
            JSON.stringify(atual.diasMenstruacao.map((dia) => formatarData(dia.data)))
        ) {
            throw new AppError('Nenhuma alteração foi identificada.', 422, 'NENHUMA_ALTERACAO');
        }
        const uniao = await prepararUniao(tx, { usuarioId, cicloId, dias });
        const preparacao = await prepararDiasOutrosCiclos(tx, {
            usuarioId,
            cicloId,
            dias: uniao.dias,
            ignorarCiclos: uniao.registros.map((registro) => registro.id),
            confirmarOutrosCiclos: true
        });
        if (!confirmarOutrosCiclos && (uniao.registros.length || preparacao.alteracoes.length)) {
            const erro = new AppError(
                'Esta edição afeta outros ciclos. Confirme para continuar.',
                409,
                'CONFIRMAR_ALTERACAO_OUTROS_CICLOS'
            );
            erro.outrosCiclos = [
                ...uniao.registros.map((registro) => ({
                    cicloId: registro.id,
                    dataInicio: formatarData(registro.dataInicio),
                    dataFim: registro.dataFim ? formatarData(registro.dataFim) : null,
                    dias: registro.diasMenstruacao.map((dia) => formatarData(dia.data)),
                    acao: 'unir'
                })),
                ...preparacao.alteracoes.map(({ ciclo, dias: novos }) => ({
                    cicloId: ciclo.id,
                    dataInicio: formatarData(ciclo.dataInicio),
                    dataFim: ciclo.dataFim ? formatarData(ciclo.dataFim) : null,
                    dias: novos.map(formatarData)
                }))
            ];
            throw erro;
        }
        await excluirCiclosUnidos(tx, usuarioId, uniao.registros);
        dias = preparacao.dias;
        await restaurarDiasOutrosCiclos(tx, usuarioId, preparacao.alteracoes);
        const where = { id: cicloId, usuarioId, atualizadoEm: atual.atualizadoEm };
        if (!dias.length) {
            const removido = await tx.registroCiclo.deleteMany({ where });
            if (removido.count !== 1)
                throw new AppError(
                    'Atualize os dados e tente novamente.',
                    409,
                    'CONFLITO_EDICAO_CICLO'
                );
            await recalcularCiclos(tx, usuarioId);
            await limparPrevisoes(tx, usuarioId);
            return null;
        }
        const grupos = agruparDias(dias);
        const primeiroGrupo = grupos[0];
        const dataInicio = primeiroGrupo[0];
        const dataFim = primeiroGrupo.at(-1);
        const conflito = await tx.registroCiclo.findFirst({
            where: {
                usuarioId,
                id: { not: cicloId },
                OR: grupos.map((grupo) => ({
                    dataInicio: { lte: grupo.at(-1) },
                    OR: [{ dataFim: null }, { dataFim: { gte: grupo[0] } }]
                }))
            },
            orderBy: { dataInicio: 'asc' },
            select: { dataInicio: true, dataFim: true }
        });
        if (conflito) {
            const falha = new AppError(
                'O período informado se sobrepõe a outro ciclo já registrado.',
                409,
                'SOBREPOSICAO_CICLO'
            );
            falha.conflito = {
                dataInicio: formatarData(conflito.dataInicio),
                dataFim: conflito.dataFim ? formatarData(conflito.dataFim) : null
            };
            throw falha;
        }
        const atualizado = await tx.registroCiclo.updateMany({
            where,
            data: { dataInicio, dataFim, duracaoMenstruacao: primeiroGrupo.length }
        });
        if (atualizado.count !== 1)
            throw new AppError(
                'Atualize os dados e tente novamente.',
                409,
                'CONFLITO_EDICAO_CICLO'
            );
        await tx.diaMenstruacao.deleteMany({ where: { registroCicloId: cicloId } });
        await tx.diaMenstruacao.createMany({
            data: primeiroGrupo.map((data) => ({
                registroCicloId: cicloId,
                data,
                statusSincronizacao: 'sincronizado'
            }))
        });
        const ciclosCriados = [];
        for (const grupo of grupos.slice(1)) {
            const novo = await tx.registroCiclo.create({
                data: {
                    usuarioId,
                    dataInicio: grupo[0],
                    dataFim: grupo.at(-1),
                    duracaoMenstruacao: grupo.length,
                    diasMenstruacao: {
                        create: grupo.map((data) => ({ data, statusSincronizacao: 'sincronizado' }))
                    }
                },
                select: { id: true }
            });
            ciclosCriados.push(novo.id);
        }
        await recalcularCiclos(tx, usuarioId);
        await limparPrevisoes(tx, usuarioId);
        const resultado = await tx.registroCiclo.findUnique({
            where: { id: cicloId },
            select: {
                id: true,
                dataInicio: true,
                dataFim: true,
                duracaoMenstruacao: true,
                duracaoCiclo: true
            }
        });
        return {
            ...resultado,
            dataInicio: formatarData(dataInicio),
            dataFim: formatarData(dataFim),
            dias: primeiroGrupo.map(formatarData),
            ...(ciclosCriados.length ? { ciclosCriados } : {}),
            ...(uniao.registros.length
                ? { ciclosUnidos: uniao.registros.map((registro) => registro.id) }
                : {}),
            ...(preparacao.alteracoes.length
                ? { ciclosAtualizados: preparacao.alteracoes.map(({ ciclo }) => ciclo.id) }
                : {})
        };
    });
}
export { editarDiasDoCiclo, agruparDias };
