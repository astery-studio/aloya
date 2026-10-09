import { obterFrequencia } from './contraceptive.constants.js';
import { FORMATO_HORARIO } from './contraceptive.validator.js';
import { dataLocalNoFuso, dataHoraNoFuso } from './contraceptiveUsage.validator.js';

const DIA_MS = 86_400_000;
const TIPOS_COM_MARCACAO = new Set(['pilula', 'injetavel', 'adesivo', 'anel_vaginal']);

// Campos DateTime de data civil permanecem armazenados à meia-noite UTC.
function dataCivil(valor) {
    if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) return null;
    return valor.toISOString().slice(0, 10);
}

function dataCivilValida(data) {
    if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
    const valor = new Date(`${data}T00:00:00.000Z`);
    return !Number.isNaN(valor.getTime()) && dataCivil(valor) === data;
}

function horariosDaAgenda(registro) {
    if (!Array.isArray(registro.horariosProgramados)) return [];
    return [...new Set(registro.horariosProgramados.filter((horario) => (
        typeof horario === 'string' && FORMATO_HORARIO.test(horario)
    )))].sort();
}

// Valida a recorrência civil sem criar registros e sem supor uma janela clínica.
function usoOcorreNaData(registro, data) {
    if (registro.ativo === false || !TIPOS_COM_MARCACAO.has(registro.tipo)) return false;
    if (!dataCivilValida(data)) return false;
    const inicio = dataCivil(registro.dataInicioUso);
    const regra = obterFrequencia(registro.tipo, registro.frequencia);
    if (!inicio || !regra || data < inicio) return false;

    const diasDesdeInicio = Math.round((Date.parse(data) - Date.parse(inicio)) / DIA_MS);
    const periodosPausa = Array.isArray(registro.periodosPausa) ? registro.periodosPausa : [];
    if (periodosPausa.some((periodo) => periodo && data >= periodo.inicio && data <= periodo.fim)) {
        return false;
    }

    // A regra continua válida após os 24 ciclos de pausa previamente materializados.
    if (regra.diasPausa && !regra.continuo) {
        const diaDoCiclo = diasDesdeInicio % (regra.diasUso + regra.diasPausa);
        if (diaDoCiclo >= regra.diasUso) return false;
    }

    // O protótipo vigente permite acompanhar o uso do anel em cada dia ativo.
    // Mantém a configuração legada de cadastro intacta; a pausa 21/7 é aplicada acima.
    if (registro.tipo === 'anel_vaginal' || regra.periodicidade === 'diaria') return true;
    if (regra.periodicidade === 'semanal') return diasDesdeInicio % 7 === 0;
    if (regra.periodicidade === 'mensal') {
        const [ano, mes, dia] = data.split('-').map(Number);
        const [anoInicio, mesInicio, diaInicio] = inicio.split('-').map(Number);
        const mesesDesdeInicio = (ano - anoInicio) * 12 + mes - mesInicio;
        return dia === diaInicio && mesesDesdeInicio % (regra.intervaloMeses ?? 1) === 0;
    }
    return false;
}

function horarioPertenceAgenda(registro, data, horario) {
    return usoOcorreNaData(registro, data) && horariosDaAgenda(registro).includes(horario);
}

function listarUsosAgendadosHoje(registro, agora, fusoHorario = 'UTC') {
    const data = dataLocalNoFuso(agora, fusoHorario);
    if (!usoOcorreNaData(registro, data)) return [];
    return horariosDaAgenda(registro).map((horario) => ({
        id: `${data}-${horario}`,
        data,
        horario,
        status: 'pendente',
        confirmadoEm: null,
        foraDoPrazo: false
    }));
}

function proximoUsoListagem(registro, agora, fusoHorario = 'UTC') {
    if (registro.ativo === false || !TIPOS_COM_MARCACAO.has(registro.tipo)) return null;
    const inicio = dataCivil(registro.dataInicioUso);
    if (!inicio) return null;
    const hoje = dataLocalNoFuso(agora, fusoHorario);
    const primeiroDia = new Date(`${inicio > hoje ? inicio : hoje}T00:00:00.000Z`);
    const horarios = horariosDaAgenda(registro);

    for (let deslocamento = 0; deslocamento <= 730; deslocamento += 1) {
        const data = dataCivil(new Date(primeiroDia.getTime() + deslocamento * DIA_MS));
        if (!usoOcorreNaData(registro, data)) continue;
        for (const horario of horarios) {
            const instante = dataHoraNoFuso(data, horario, fusoHorario);
            if (instante && instante > agora) return instante;
        }
    }
    return null;
}

export {
    dataCivil,
    horarioPertenceAgenda,
    listarUsosAgendadosHoje,
    proximoUsoListagem,
    usoOcorreNaData
};
