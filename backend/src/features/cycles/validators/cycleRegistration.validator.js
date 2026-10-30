import { AppError } from '../../../shared/errors/AppError.js';
import { diferencaDias, formatarData } from '../utils/calendar.js';

function validarRegistroMenstrual({ usuarioId, corpo, chave, agora }) {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');
    }
    if (typeof chave !== 'string' || !/^[A-Za-z0-9._:-]{8,128}$/.test(chave)) {
        throw new AppError(
            'Informe um Idempotency-Key válido para sincronizar.',
            422,
            'CHAVE_SINCRONIZACAO_INVALIDA'
        );
    }
    const campos = Object.keys(corpo ?? {});
    const unico = campos.length === 1 && campos[0] === 'data';
    const intervalo =
        campos.length === 2 && campos.includes('dataInicio') && campos.includes('dataFim');
    if (!corpo || Array.isArray(corpo) || (!unico && !intervalo)) {
        throw new AppError(
            'Informe um dia ou um intervalo consecutivo.',
            422,
            'REGISTRO_MENSTRUAL_INVALIDO'
        );
    }
    let inicio, fim;
    try {
        const a = unico ? corpo.data : corpo.dataInicio;
        const b = unico ? corpo.data : corpo.dataFim;
        if (typeof a !== 'string' || typeof b !== 'string') throw new TypeError();
        inicio = formatarData(a);
        fim = formatarData(b);
    } catch {
        throw new AppError(
            'Informe datas válidas no formato AAAA-MM-DD.',
            422,
            'DATA_MENSTRUAL_INVALIDA'
        );
    }
    if (inicio > fim || diferencaDias(inicio, fim) >= 366) {
        throw new AppError(
            'O intervalo deve conter entre 1 e 366 dias consecutivos.',
            422,
            'INTERVALO_MENSTRUAL_INVALIDO'
        );
    }
    if (fim > formatarData(agora)) {
        throw new AppError('Não é possível marcar datas futuras.', 422, 'DATA_MENSTRUAL_FUTURA');
    }
    return { usuarioId, chave, inicio, fim };
}

export { validarRegistroMenstrual };
