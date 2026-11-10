import { AppError } from '../../../shared/errors/AppError.js';
import { incluirCiclosProximos } from '../utils/cycleContinuity.js';

async function prepararUniao(tx, { usuarioId, cicloId, dias }) {
    if (!dias.length) return { dias, registros: [] };
    const registros = await tx.registroCiclo.findMany({
        where: { usuarioId, id: { not: cicloId } },
        include: { diasMenstruacao: { orderBy: { data: 'asc' } } },
        orderBy: { dataInicio: 'asc' }
    });
    return incluirCiclosProximos(dias, registros);
}
async function excluirCiclosUnidos(tx, usuarioId, registros) {
    for (const registro of registros) {
        const excluido = await tx.registroCiclo.deleteMany({
            where: { id: registro.id, usuarioId, atualizadoEm: registro.atualizadoEm }
        });
        if (excluido.count !== 1)
            throw new AppError(
                'Atualize os dados e tente novamente.',
                409,
                'CONFLITO_EDICAO_CICLO'
            );
    }
}
export { prepararUniao, excluirCiclosUnidos };
