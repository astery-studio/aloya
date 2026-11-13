import { AppError } from '../../../shared/errors/AppError.js';
import { CATALOGO_DIARIO } from '../catalog/diary.catalog.js';

const MACROS = new Set(CATALOGO_DIARIO.map(({ id }) => id));
const CATEGORIAS = new Set(
    CATALOGO_DIARIO.flatMap(({ categorias }) => categorias.map(({ id }) => id))
);
const CAMPOS = new Set(['versao', 'macrocategorias', 'categorias']);

function validarItens(itens, idsPermitidos, maximo) {
    if (itens === undefined) return [];
    if (!Array.isArray(itens) || itens.length > maximo) {
        throw new AppError('A lista de preferências é inválida.', 422, 'PREFERENCIAS_INVALIDAS');
    }
    const ids = new Set();
    for (const item of itens) {
        const objeto = item && typeof item === 'object' && !Array.isArray(item);
        if (
            !objeto ||
            Object.keys(item).length !== 2 ||
            !Object.hasOwn(item, 'id') ||
            !Object.hasOwn(item, 'ativa') ||
            !idsPermitidos.has(item.id) ||
            typeof item.ativa !== 'boolean' ||
            ids.has(item.id)
        ) {
            throw new AppError('Uma preferência é inválida.', 422, 'PREFERENCIAS_INVALIDAS');
        }
        ids.add(item.id);
    }
    return itens.map(({ id, ativa }) => ({ id, ativa }));
}

function validarLotePreferencias(corpo) {
    if (
        !corpo ||
        typeof corpo !== 'object' ||
        Array.isArray(corpo) ||
        Object.keys(corpo).some((campo) => !CAMPOS.has(campo))
    ) {
        throw new AppError(
            'Informe somente preferências permitidas.',
            422,
            'PREFERENCIAS_INVALIDAS'
        );
    }
    if (!Number.isSafeInteger(corpo.versao) || corpo.versao < 0) {
        throw new AppError(
            'A versão das preferências é inválida.',
            422,
            'VERSAO_PREFERENCIAS_INVALIDA'
        );
    }
    const macrocategorias = validarItens(corpo.macrocategorias, MACROS, MACROS.size);
    const categorias = validarItens(corpo.categorias, CATEGORIAS, CATEGORIAS.size);
    if (macrocategorias.length + categorias.length === 0) {
        throw new AppError('Informe ao menos uma preferência.', 422, 'PREFERENCIAS_INVALIDAS');
    }
    return { versao: corpo.versao, macrocategorias, categorias };
}

export { validarLotePreferencias };
