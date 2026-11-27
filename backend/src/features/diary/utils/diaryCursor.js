import crypto from 'node:crypto';
import { AppError } from '../../../shared/errors/AppError.js';
import { ehDataCalendarioValida } from '../../cycles/utils/calendar.js';

function assinaturaFiltros(filtros) {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(filtros))
        .digest('base64url')
        .slice(0, 16);
}

function codificarCursor({ data, id }, filtros) {
    return Buffer.from(
        JSON.stringify({
            data,
            id,
            filtros: assinaturaFiltros(filtros)
        })
    ).toString('base64url');
}

function decodificarCursor(cursor, filtros) {
    if (typeof cursor !== 'string' || cursor.length === 0 || cursor.length > 512) {
        throw new AppError('O cursor informado é inválido.', 422, 'CURSOR_DIARIO_INVALIDO');
    }
    try {
        const dados = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
        const campos = Object.keys(dados);
        const valido =
            campos.length === 3 &&
            campos.every((campo) => ['data', 'id', 'filtros'].includes(campo)) &&
            ehDataCalendarioValida(dados.data) &&
            Number.isSafeInteger(dados.id) &&
            dados.id > 0 &&
            dados.filtros === assinaturaFiltros(filtros);
        if (!valido) throw new Error('cursor inválido');
        return dados;
    } catch {
        throw new AppError('O cursor informado é inválido.', 422, 'CURSOR_DIARIO_INVALIDO');
    }
}

export { codificarCursor, decodificarCursor };
