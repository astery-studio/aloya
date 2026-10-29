import { AppError } from '../../../shared/errors/AppError.js';

const DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

function validarUsuarioId(usuarioId) {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');
    }

    return usuarioId;
}

function validarCicloId(cicloId) {
    const texto = typeof cicloId === 'number' ? String(cicloId) : cicloId;

    if (typeof texto !== 'string' || !/^[1-9]\d*$/.test(texto)) {
        throw new AppError('O registro de menstruação é inválido.', 400, 'CICLO_INVALIDO');
    }

    const id = Number(texto);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError('O registro de menstruação é inválido.', 400, 'CICLO_INVALIDO');
    }

    return id;
}

function validarDataRegistro(data) {
    const partes = typeof data === 'string' ? DATA_ISO.exec(data) : null;

    if (!partes) {
        throw new AppError('A data do registro é inválida.', 400, 'DATA_REGISTRO_INVALIDA');
    }

    const [ano, mes, dia] = partes.slice(1).map(Number);
    const dataUtc = new Date(Date.UTC(ano, mes - 1, dia));
    const dataValida =
        dataUtc.getUTCFullYear() === ano &&
        dataUtc.getUTCMonth() === mes - 1 &&
        dataUtc.getUTCDate() === dia;

    if (!dataValida || ano < 1900) {
        throw new AppError('A data do registro é inválida.', 400, 'DATA_REGISTRO_INVALIDA');
    }

    return dataUtc;
}

function validarRemocaoDia({ usuarioId, cicloId, data } = {}) {
    return {
        usuarioId: validarUsuarioId(usuarioId),
        cicloId: validarCicloId(cicloId),
        data: validarDataRegistro(data)
    };
}

function validarExclusaoCiclo({ usuarioId, cicloId } = {}) {
    return {
        usuarioId: validarUsuarioId(usuarioId),
        cicloId: validarCicloId(cicloId)
    };
}

export {
    validarCicloId,
    validarDataRegistro,
    validarExclusaoCiclo,
    validarRemocaoDia,
    validarUsuarioId
};
