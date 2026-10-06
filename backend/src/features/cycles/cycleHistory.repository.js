//Consulta páginas do histórico sem expor dados de outras contas ou carregar todos os registros.
import {
    LIMITE_MAXIMO,
    criarCursorHistorico
} from './cycleHistory.validator.js';

const SELECAO_DO_CICLO = Object.freeze({
    id: true,
    dataInicio: true,
    dataFim: true,
    duracaoMenstruacao: true,
    duracaoCiclo: true,
    classificacao: true,
    ehCicloInicial: true
});

//Confere se o identificador interno da pessoa usuária é válido.
function validarUsuarioId(usuarioId) {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw new TypeError('O identificador da pessoa usuária é inválido.');
    }
}

//Confere novamente o limite antes de executar a consulta no banco.
function validarLimite(limite) {
    if (
        !Number.isSafeInteger(limite)
        || limite <= 0
        || limite > LIMITE_MAXIMO
    ) {
        throw new TypeError('O limite interno da página é inválido.');
    }
}

//Confere se o cursor já decodificado possui data e identificador válidos.
function validarCursor(cursor) {
    if (cursor === null || cursor === undefined) {
        return;
    }

    if (
        typeof cursor !== 'object'
        || Array.isArray(cursor)
        || !(cursor.dataInicio instanceof Date)
        || Number.isNaN(cursor.dataInicio.getTime())
        || !Number.isSafeInteger(cursor.id)
        || cursor.id <= 0
    ) {
        throw new TypeError('O cursor interno da página é inválido.');
    }
}

//Monta o filtro estável que busca somente registros posteriores ao cursor na ordenação.
function criarFiltro(usuarioId, cursor) {
    if (!cursor) {
        return {
            usuarioId
        };
    }

    return {
        usuarioId,
        OR: [
            {
                dataInicio: {
                    lt: cursor.dataInicio
                }
            },
            {
                dataInicio: cursor.dataInicio,
                id: {
                    lt: cursor.id
                }
            }
        ]
    };
}

//Cria o acesso paginado ao histórico usando somente operações necessárias do Prisma.
function criarCycleHistoryRepository({prisma} = {}) {
    if (
        !prisma
        || typeof prisma.registroCiclo?.findMany !== 'function'
    ) {
        throw new TypeError('O Prisma do histórico de ciclos é inválido.');
    }

    //Busca uma página e usa um registro adicional apenas para detectar continuidade.
    async function listarPagina({
        usuarioId,
        limite,
        cursor = null
    } = {}) {
        validarUsuarioId(usuarioId);
        validarLimite(limite);
        validarCursor(cursor);

        const registrosEncontrados = await prisma.registroCiclo.findMany({
            where: criarFiltro(
                usuarioId,
                cursor
            ),
            orderBy: [
                {
                    dataInicio: 'desc'
                },
                {
                    id: 'desc'
                }
            ],
            take: limite + 1,
            select: SELECAO_DO_CICLO
        });

        if (!Array.isArray(registrosEncontrados)) {
            throw new TypeError('A consulta do histórico retornou um resultado inválido.');
        }

        const temMais = registrosEncontrados.length > limite;
        const registros = temMais
            ? registrosEncontrados.slice(0, limite)
            : registrosEncontrados.slice();

        const ultimoRegistro = registros.at(-1);
        const proximoCursor = temMais && ultimoRegistro
            ? criarCursorHistorico({
                dataInicio: ultimoRegistro.dataInicio,
                id: ultimoRegistro.id
            })
            : null;

        return {
            registros,
            temMais,
            proximoCursor
        };
    }

    return {
        listarPagina
    };
}

export {
    criarCycleHistoryRepository
};