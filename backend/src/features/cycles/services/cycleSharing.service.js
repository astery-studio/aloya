import { AppError } from '../../../shared/errors/AppError.js';
import { permiteHistorico } from '../utils/cycleRegistration.js';
import { formatarData } from '../utils/calendar.js';

function criarCycleSharingService({ prisma }) {
    if (typeof prisma?.$transaction !== 'function')
        throw new TypeError('Serviço de compartilhamento inválido.');
    async function buscar({ contatoId, titularId, antesDe }) {
        if (!Number.isSafeInteger(contatoId) || contatoId <= 0) {
            throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');
        }
        const titular = Number(titularId);
        const cursor = antesDe === undefined ? null : Number(antesDe);
        if (
            !/^[1-9]\d*$/.test(String(titularId)) ||
            !Number.isSafeInteger(titular) ||
            (cursor !== null &&
                (!/^[1-9]\d*$/.test(String(antesDe)) || !Number.isSafeInteger(cursor)))
        ) {
            throw new AppError(
                'Consulta de compartilhamento inválida.',
                422,
                'CONSULTA_COMPARTILHAMENTO_INVALIDA'
            );
        }
        return prisma.$transaction(async (tx) => {
            const vinculos = await tx.vinculoRedeApoio.findMany({
                where: { titularId: titular, contatoId, status: 'ativo' },
                include: { categoria: true }
            });
            if (!vinculos.some(permiteHistorico))
                throw new AppError(
                    'Compartilhamento não encontrado.',
                    404,
                    'COMPARTILHAMENTO_NAO_ENCONTRADO'
                );
            const registros = await tx.registroCiclo.findMany({
                where: { usuarioId: titular, ...(cursor ? { id: { lt: cursor } } : {}) },
                orderBy: { id: 'desc' },
                take: 51,
                select: {
                    id: true,
                    dataInicio: true,
                    dataFim: true,
                    duracaoMenstruacao: true,
                    duracaoCiclo: true,
                    diasMenstruacao: { orderBy: { data: 'asc' }, select: { data: true } }
                }
            });
            const pagina = registros.slice(0, 50);
            return {
                ciclos: pagina.map((ciclo) => ({
                    ...ciclo,
                    dataInicio: formatarData(ciclo.dataInicio),
                    dataFim: ciclo.dataFim ? formatarData(ciclo.dataFim) : null,
                    diasMenstruacao: ciclo.diasMenstruacao.map((dia) => ({
                        data: formatarData(dia.data)
                    }))
                })),
                proximoCursor: registros.length > 50 ? pagina.at(-1).id : null
            };
        });
    }
    return { buscar };
}

export { criarCycleSharingService };
