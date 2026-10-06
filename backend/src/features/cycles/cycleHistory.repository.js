//Consulta páginas, totais e posições do histórico sem expor dados de outras contas.
import {LIMITE_MAXIMO, criarCursorHistorico} from './cycleHistory.validator.js';

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
    if (!Number.isSafeInteger(limite) || limite <= 0 || limite > LIMITE_MAXIMO) {
        throw new TypeError('O limite interno da página é inválido.');
    }
}

//Confere se o cursor já decodificado possui data e identificador válidos.
function validarCursor(cursor) {
    if (cursor === null || cursor === undefined) {
        return;
    }

    if (typeof cursor !== 'object' || Array.isArray(cursor) || !(cursor.dataInicio instanceof Date) || Number.isNaN(cursor.dataInicio.getTime()) || !Number.isSafeInteger(cursor.id) || cursor.id <= 0) {
        throw new TypeError('O cursor interno da página é inválido.');
    }
}

//Confere se uma contagem devolvida pelo banco pode ser usada com segurança.
function validarContagem(quantidade) {
    if (!Number.isSafeInteger(quantidade) || quantidade < 0) {
        throw new TypeError('A contagem do histórico retornou um resultado inválido.');
    }
}

//Monta o filtro que busca somente registros posteriores ao cursor na ordenação.
function criarFiltroDaPagina(usuarioId, cursor) {
    if (!cursor) {
        return {usuarioId};
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

//Monta o filtro que conta os registros já percorridos, incluindo o item do cursor.
function criarFiltroDaPosicao(usuarioId, cursor) {
    return {
        usuarioId,
        OR: [
            {
                dataInicio: {
                    gt: cursor.dataInicio
                }
            },
            {
                dataInicio: cursor.dataInicio,
                id: {
                    gte: cursor.id
                }
            }
        ]
    };
}

//Cria o acesso paginado ao histórico usando somente operações necessárias do Prisma.
function criarCycleHistoryRepository({prisma} = {}) {
    if (!prisma || typeof prisma.registroCiclo?.findMany !== 'function' || typeof prisma.registroCiclo?.count !== 'function') {
        throw new TypeError('O Prisma do histórico de ciclos é inválido.');
    }

    //Busca uma página e usa um registro adicional apenas para detectar continuidade.
    async function listarPagina({usuarioId, limite, cursor = null} = {}) {
        validarUsuarioId(usuarioId);
        validarLimite(limite);
        validarCursor(cursor);

        const registrosEncontrados = await prisma.registroCiclo.findMany({
            where: criarFiltroDaPagina(usuarioId, cursor),
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
        const registros = temMais ? registrosEncontrados.slice(0, limite) : registrosEncontrados.slice();
        const ultimoRegistro = registros.at(-1);
        const proximoCursor = temMais && ultimoRegistro ? criarCursorHistorico({
            dataInicio: ultimoRegistro.dataInicio,
            id: ultimoRegistro.id
        }) : null;

        return {
            registros,
            temMais,
            proximoCursor
        };
    }

    //Conta somente os ciclos pertencentes à pessoa autenticada.
    async function contarDoUsuario(usuarioId) {
        validarUsuarioId(usuarioId);

        const quantidade = await prisma.registroCiclo.count({
            where: {
                usuarioId
            }
        });

        validarContagem(quantidade);
        return quantidade;
    }

    //Conta quantos ciclos já foram percorridos antes da página solicitada.
    async function contarAteCursor(usuarioId, cursor = null) {
        validarUsuarioId(usuarioId);
        validarCursor(cursor);

        if (!cursor) {
            return 0;
        }

        const quantidade = await prisma.registroCiclo.count({
            where: criarFiltroDaPosicao(usuarioId, cursor)
        });

        validarContagem(quantidade);
        return quantidade;
    }

    return {
        listarPagina,
        contarDoUsuario,
        contarAteCursor
    };
}

export {criarCycleHistoryRepository};