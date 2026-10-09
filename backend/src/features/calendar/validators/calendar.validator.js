//Valida e normaliza o mês solicitado para o calendário.
import { AppError } from '../../../shared/errors/AppError.js';

const FORMATO_MES = /^(\d{4})-(0[1-9]|1[0-2])$/;
const MENSAGEM_MES_INVALIDO = 'Informe o mês no formato AAAA-MM.';

function validarMesCalendario(mesRecebido) {
    if (typeof mesRecebido !== 'string') {
        throw new AppError(MENSAGEM_MES_INVALIDO, 422, 'MES_CALENDARIO_INVALIDO');
    }

    const correspondencia = FORMATO_MES.exec(mesRecebido);

    if (!correspondencia) {
        throw new AppError(MENSAGEM_MES_INVALIDO, 422, 'MES_CALENDARIO_INVALIDO');
    }

    const ano = Number(correspondencia[1]);
    const mes = Number(correspondencia[2]);

    if (ano < 1) {
        throw new AppError(MENSAGEM_MES_INVALIDO, 422, 'MES_CALENDARIO_INVALIDO');
    }

    return {
        chave: mesRecebido,
        ano,
        mes
    };
}

export { validarMesCalendario };