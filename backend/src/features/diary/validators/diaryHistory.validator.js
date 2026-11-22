import { AppError } from '../../../shared/errors/AppError.js';
import { ehDataCalendarioValida } from '../../cycles/utils/calendar.js';
import { CATEGORIAS_POR_ID } from '../catalog/diaryCatalog.lookup.js';
const CAMPOS = new Set(['limite', 'cursor', 'dataInicio', 'dataFim', 'categorias', 'fases']);
const FASES = new Set(['menstrual', 'folicular', 'ovulatoria', 'lutea']);
function listaSeparada(valor, campo, maximo) {
    if (valor === undefined) return [];
    if (typeof valor !== 'string' || valor.length === 0 || valor.length > 1000) {
        throw new AppError(`O filtro ${campo} é inválido.`, 422, 'FILTRO_DIARIO_INVALIDO');
    }
    const itens = valor.split(',');
    if (
        itens.some((item) => !item) ||
        new Set(itens).size !== itens.length ||
        itens.length > maximo
    ) {
        throw new AppError(`O filtro ${campo} é inválido.`, 422, 'FILTRO_DIARIO_INVALIDO');
    }
    return itens.toSorted();
}
function validarData(valor, campo) {
    if (valor === undefined) return null;
    if (!ehDataCalendarioValida(valor)) {
        throw new AppError(`A ${campo} é inválida.`, 422, 'FILTRO_DATA_INVALIDO');
    }
    return valor;
}
function validarHistorico(query = {}) {
    if (
        !query ||
        typeof query !== 'object' ||
        Array.isArray(query) ||
        Object.keys(query).some((campo) => !CAMPOS.has(campo))
    ) {
        throw new AppError('Informe somente filtros permitidos.', 422, 'FILTRO_DIARIO_INVALIDO');
    }
    const limite = query.limite === undefined ? 20 : Number(query.limite);
    if (
        !/^\d+$/.test(query.limite ?? '20') ||
        !Number.isSafeInteger(limite) ||
        limite < 1 ||
        limite > 50
    ) {
        throw new AppError('O limite deve estar entre 1 e 50.', 422, 'LIMITE_DIARIO_INVALIDO');
    }
    const dataInicio = validarData(query.dataInicio, 'data inicial');
    const dataFim = validarData(query.dataFim, 'data final');
    if (dataInicio && dataFim && dataInicio > dataFim) {
        throw new AppError(
            'A data inicial não pode ser posterior à data final.',
            422,
            'PERIODO_DIARIO_INVALIDO'
        );
    }
    const categorias = listaSeparada(query.categorias, 'categorias', CATEGORIAS_POR_ID.size);
    if (categorias.some((id) => !CATEGORIAS_POR_ID.has(id))) {
        throw new AppError('Uma categoria do filtro não existe.', 422, 'CATEGORIA_FILTRO_INVALIDA');
    }
    const fases = listaSeparada(query.fases, 'fases', FASES.size);
    if (fases.some((fase) => !FASES.has(fase))) {
        throw new AppError('Uma fase do filtro é inválida.', 422, 'FASE_FILTRO_INVALIDA');
    }
    return {
        limite,
        cursor: query.cursor ?? null,
        filtros: { dataInicio, dataFim, categorias, fases }
    };
}
export { validarHistorico };
