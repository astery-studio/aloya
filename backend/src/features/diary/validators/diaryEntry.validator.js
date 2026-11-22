import { AppError } from '../../../shared/errors/AppError.js';
import { ehDataCalendarioValida } from '../../cycles/utils/calendar.js';
import { CATEGORIAS_POR_ID } from '../catalog/diaryCatalog.lookup.js';
import { validarCategoriaPreenchida } from './diaryCategory.validator.js';

const CAMPOS_PERMITIDOS = new Set(['data', 'fusoHorario', 'categorias']);

function validarFusoHorario(valor) {
    if (typeof valor !== 'string' || valor.length === 0 || valor.length > 100) {
        throw new AppError('Informe um fuso horário válido.', 422, 'FUSO_HORARIO_INVALIDO');
    }
    try {
        return new Intl.DateTimeFormat('en', { timeZone: valor }).resolvedOptions().timeZone;
    } catch {
        throw new AppError('Informe um fuso horário válido.', 422, 'FUSO_HORARIO_INVALIDO');
    }
}

function validarCriacaoRegistro(corpo) {
    const objetoValido =
        corpo &&
        typeof corpo === 'object' &&
        !Array.isArray(corpo) &&
        [Object.prototype, null].includes(Object.getPrototypeOf(corpo));
    if (!objetoValido) {
        throw new AppError('Informe os dados do registro.', 422, 'REGISTRO_DIARIO_INVALIDO');
    }
    if (Object.keys(corpo).some((campo) => !CAMPOS_PERMITIDOS.has(campo))) {
        throw new AppError('Informe somente os campos permitidos.', 422, 'CAMPO_DESCONHECIDO');
    }
    if (!ehDataCalendarioValida(corpo.data)) {
        throw new AppError('Informe uma data válida.', 422, 'DATA_REGISTRO_INVALIDA');
    }
    if (
        !Array.isArray(corpo.categorias) ||
        corpo.categorias.length === 0 ||
        corpo.categorias.length > CATEGORIAS_POR_ID.size
    ) {
        throw new AppError('Preencha ao menos uma categoria.', 422, 'CONTEUDO_DIARIO_OBRIGATORIO');
    }

    const categorias = corpo.categorias.map(validarCategoriaPreenchida);
    const ids = categorias.map(({ categoriaId }) => categoriaId);
    if (new Set(ids).size !== ids.length) {
        throw new AppError('Não repita categorias no registro.', 422, 'CATEGORIA_DIARIO_DUPLICADA');
    }

    return {
        data: corpo.data,
        fusoHorario: validarFusoHorario(corpo.fusoHorario),
        categorias
    };
}

export { validarCriacaoRegistro, validarFusoHorario };
