import { adicionarDias, paraDataCalendario } from '../../cycles/utils/calendar.js';

function criarWhereHistorico(usuarioId, filtros, cursor) {
    const where = { usuarioId, AND: [] };

    if (filtros.dataInicio || filtros.dataFim) {
        const dataRegistro = {};
        if (filtros.dataInicio) dataRegistro.gte = paraDataCalendario(filtros.dataInicio);
        if (filtros.dataFim) {
            dataRegistro.lt = paraDataCalendario(adicionarDias(filtros.dataFim, 1));
        }
        where.AND.push({ dataRegistro });
    }
    if (filtros.categorias.length) {
        where.AND.push({
            categorias: { some: { categoriaId: { in: filtros.categorias } } }
        });
    }
    if (filtros.fases.length) {
        where.AND.push({ faseCicloAssociada: { in: filtros.fases } });
    }
    if (cursor) {
        const data = paraDataCalendario(cursor.data);
        where.AND.push({
            OR: [{ dataRegistro: { lt: data } }, { dataRegistro: data, id: { lt: cursor.id } }]
        });
    }
    if (where.AND.length === 0) delete where.AND;

    return where;
}

const SELECAO_RESUMO = {
    id: true,
    dataRegistro: true,
    faseCicloAssociada: true,
    versao: true,
    atualizadoEm: true,
    categorias: {
        where: {
            OR: [{ categoriaId: 'anotacao_livre' }, { categoria: { sensivel: false } }]
        },
        select: {
            categoriaId: true,
            categoriaNome: true,
            valorEscalado: true,
            casasDecimais: true,
            valorDuracaoMinutos: true,
            valorTexto: true,
            opcoes: {
                select: { opcaoId: true, opcaoNome: true }
            }
        }
    }
};

export { criarWhereHistorico, SELECAO_RESUMO };
