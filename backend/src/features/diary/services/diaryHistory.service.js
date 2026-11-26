import { AppError } from '../../../shared/errors/AppError.js';
import { diferencaDias, formatarData, paraDataCalendario } from '../../cycles/utils/calendar.js';
import { apresentarResumoRegistro } from '../presenters/diaryHistory.presenter.js';
import { codificarCursor, decodificarCursor } from '../utils/diaryCursor.js';
import { obterCategoriasAtivas, validarCategoriasDoFiltro } from './diaryActiveCategories.js';
import { criarWhereHistorico, SELECAO_RESUMO } from './diaryHistory.query.js';

function criarDiaryHistoryService({ prisma } = {}) {
    if (!prisma?.registroDiario?.findMany || !prisma?.registroCiclo?.findMany) {
        throw new TypeError('Não foi possível configurar o histórico do Diário.');
    }

    function calcularDiaCiclo(dataRegistro, ciclos) {
        const ciclo = ciclos.find(({ dataInicio }) => dataInicio <= dataRegistro);
        if (!ciclo) return null;
        const dia = diferencaDias(ciclo.dataInicio, dataRegistro) + 1;
        return Number.isSafeInteger(dia) && dia > 0 ? dia : null;
    }

    async function validarCursor(usuarioId, cursor, filtros) {
        if (!cursor) return null;
        const dados = decodificarCursor(cursor, filtros);
        const registro = await prisma.registroDiario.findFirst({
            where: {
                id: dados.id,
                usuarioId,
                dataRegistro: paraDataCalendario(dados.data)
            },
            select: { id: true }
        });
        if (!registro) {
            throw new AppError('O cursor informado é inválido.', 422, 'CURSOR_DIARIO_INVALIDO');
        }
        return dados;
    }

    async function listar(usuarioId, { limite, cursor, filtros }) {
        if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
            throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');
        }
        const [preferenciasMacro, preferenciasCategoria] = await Promise.all([
            prisma.preferenciaMacrocategoriaDiario.findMany({ where: { usuarioId } }),
            prisma.preferenciaCategoriaDiario.findMany({ where: { usuarioId } })
        ]);
        const categoriasAtivas = obterCategoriasAtivas(preferenciasMacro, preferenciasCategoria);
        validarCategoriasDoFiltro(filtros, categoriasAtivas);
        const cursorValidado = await validarCursor(usuarioId, cursor, filtros);
        const registros = await prisma.registroDiario.findMany({
            where: criarWhereHistorico(usuarioId, filtros, cursorValidado, categoriasAtivas),
            orderBy: [{ dataRegistro: 'desc' }, { id: 'desc' }],
            take: limite + 1,
            select: SELECAO_RESUMO
        });
        const possuiProxima = registros.length > limite;
        const pagina = registros.slice(0, limite);
        const ultimo = pagina.at(-1);
        const ciclos = pagina.length
            ? await prisma.registroCiclo.findMany({
                  where: { usuarioId, dataInicio: { lte: pagina[0].dataRegistro } },
                  orderBy: [{ dataInicio: 'desc' }, { id: 'desc' }],
                  select: { dataInicio: true }
              })
            : [];

        return {
            itens: pagina.map((registro) =>
                apresentarResumoRegistro(
                    registro,
                    categoriasAtivas,
                    calcularDiaCiclo(registro.dataRegistro, ciclos)
                )
            ),
            proximoCursor:
                possuiProxima && ultimo
                    ? codificarCursor(
                          { data: formatarData(ultimo.dataRegistro), id: ultimo.id },
                          filtros
                      )
                    : null
        };
    }

    return { calcularDiaCiclo, listar };
}

export { criarDiaryHistoryService };
