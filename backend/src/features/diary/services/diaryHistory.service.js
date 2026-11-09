import { AppError } from '../../../shared/errors/AppError.js';
import { formatarData, paraDataCalendario } from '../../cycles/utils/calendar.js';
import { apresentarResumoRegistro } from '../presenters/diaryHistory.presenter.js';
import { codificarCursor, decodificarCursor } from '../utils/diaryCursor.js';
import { obterCategoriasAtivas, validarCategoriasDoFiltro } from './diaryActiveCategories.js';
import { criarWhereHistorico, SELECAO_RESUMO } from './diaryHistory.query.js';

function criarDiaryHistoryService({ prisma } = {}) {
    if (!prisma?.registroDiario?.findMany) {
        throw new TypeError('Não foi possível configurar o histórico do Diário.');
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
            where: criarWhereHistorico(usuarioId, filtros, cursorValidado),
            orderBy: [{ dataRegistro: 'desc' }, { id: 'desc' }],
            take: limite + 1,
            select: SELECAO_RESUMO
        });
        const possuiProxima = registros.length > limite;
        const pagina = registros.slice(0, limite);
        const ultimo = pagina.at(-1);

        return {
            itens: pagina.map((registro) => apresentarResumoRegistro(registro, categoriasAtivas)),
            proximoCursor:
                possuiProxima && ultimo
                    ? codificarCursor(
                          { data: formatarData(ultimo.dataRegistro), id: ultimo.id },
                          filtros
                      )
                    : null
        };
    }

    return { listar };
}

export { criarDiaryHistoryService };
