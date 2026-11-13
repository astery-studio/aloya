import { AppError } from '../../../shared/errors/AppError.js';

const CAMPOS_PERMITIDOS = new Set(['versao', 'ativa']);

function validarAtualizacaoPreferencia(corpo) {
    if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
        throw new AppError('Informe a preferência.', 422, 'PREFERENCIA_INVALIDA');
    }

    const campoDesconhecido = Object.keys(corpo).find((campo) => !CAMPOS_PERMITIDOS.has(campo));
    if (campoDesconhecido) {
        throw new AppError(
            `O campo ${campoDesconhecido} não é permitido.`,
            422,
            'CAMPO_DESCONHECIDO'
        );
    }

    if (!Number.isSafeInteger(corpo.versao) || corpo.versao < 0) {
        throw new AppError(
            'A versão das preferências é inválida.',
            422,
            'VERSAO_PREFERENCIAS_INVALIDA'
        );
    }

    if (typeof corpo.ativa !== 'boolean') {
        throw new AppError(
            'O estado da preferência deve ser verdadeiro ou falso.',
            422,
            'ESTADO_PREFERENCIA_INVALIDO'
        );
    }

    return { versao: corpo.versao, ativa: corpo.ativa };
}

export { validarAtualizacaoPreferencia };
