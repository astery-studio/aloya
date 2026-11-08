import {
    DIAS_PARA_CONVITE_ATRASADO,
    STATUS_CONTATO_ATIVO,
    STATUS_CONTATO_PENDENTE
} from '../constants/supportContact.constants.js';

const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

function inicioUtcDoDia(data) {
    return Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
}

function calcularDiasAguardando(dataEnvio, agora = new Date()) {
    if (!(dataEnvio instanceof Date) || Number.isNaN(dataEnvio.getTime())) return 0;
    if (!(agora instanceof Date) || Number.isNaN(agora.getTime())) return 0;

    const diferenca = inicioUtcDoDia(agora) - inicioUtcDoDia(dataEnvio);
    return Math.max(0, Math.floor(diferenca / MILISSEGUNDOS_POR_DIA));
}

function criarResumoEspera(status, dataEnvio, agora) {
    if (status !== STATUS_CONTATO_PENDENTE) return null;

    const dias = calcularDiasAguardando(dataEnvio, agora);
    return Object.freeze({
        dias,
        atrasado: dias > DIAS_PARA_CONVITE_ATRASADO,
        rotulo: `Aguardando há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
    });
}

export {
    calcularDiasAguardando,
    criarResumoEspera,
    STATUS_CONTATO_ATIVO,
    STATUS_CONTATO_PENDENTE
};
