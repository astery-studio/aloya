import { FREQUENCIAS } from '../constants/contraceptive.constants.js';
import { dataLocalNoFuso } from '../validators/contraceptiveUsage.validator.js';
import {
    dataCivil,
    listarUsosAgendadosHoje,
    proximoUsoListagem
} from '../utils/contraceptive.listing.schedule.js';

function timestamp(valor) {
    return valor instanceof Date && !Number.isNaN(valor.getTime()) ? valor.toISOString() : null;
}

function estadoDoUso(uso) {
    if (uso.statusUso === 'confirmado') return uso.confirmacaoForaPrazo ? 'foraDoPrazo' : 'confirmado';
    if (uso.statusUso === 'nao_confirmado') return 'naoConfirmado';
    return 'pendente';
}

function apresentarUsoHistorico(uso) {
    return {
        id: String(uso.id),
        data: dataCivil(uso.dataUsoProgramado),
        horarioProgramado: uso.horarioProgramado,
        confirmadoEm: timestamp(uso.horarioRealConfirmacao),
        estado: estadoDoUso(uso)
    };
}

function apresentarUsoDoDia(uso) {
    const historico = apresentarUsoHistorico(uso);
    return {
        id: historico.id,
        data: historico.data,
        horario: historico.horarioProgramado,
        // A dose desmarcada continua disponível para confirmação, mesmo após o prazo.
        status: uso.statusUso === 'pendente' ? 'pendente' : historico.estado,
        confirmadoEm: historico.confirmadoEm,
        foraDoPrazo: historico.estado === 'foraDoPrazo'
    };
}

function apresentarValidade(registro, agora, fusoHorario) {
    if (registro.tipo !== 'diu_hormonal' || !dataCivil(registro.dataValidade)) return {};
    const hoje = dataLocalNoFuso(agora, fusoHorario);
    const dias = Math.round((Date.parse(dataCivil(registro.dataValidade)) - Date.parse(hoje)) / 86_400_000);
    return {
        validadeExpirada: dias < 0,
        validadeRestante: dias < 0 ? 'Validade encerrada'
            : dias === 0 ? 'Vence hoje' : `Vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`
    };
}

// Este contrato pertence à HU-019 e não altera as respostas de cadastro/edição.
function apresentarAnticoncepcionalListagem(registro, agora = new Date(), fusoHorario = 'UTC') {
    const frequenciaId = Object.entries(FREQUENCIAS[registro.tipo] ?? {})
        .find(([, regra]) => regra.valor === registro.frequencia)?.[0] ?? null;
    const historico = (Array.isArray(registro.usos) ? registro.usos : [])
        .map(apresentarUsoHistorico)
        .sort((a, b) => `${b.data}-${b.horarioProgramado}`.localeCompare(`${a.data}-${a.horarioProgramado}`));
    const usosPersistidos = new Map((Array.isArray(registro.usos) ? registro.usos : [])
        .map((uso) => [
            `${dataCivil(uso.dataUsoProgramado)}-${uso.horarioProgramado}`,
            apresentarUsoDoDia(uso)
        ]));
    const usosHoje = listarUsosAgendadosHoje(registro, agora, fusoHorario)
        .map((uso) => usosPersistidos.get(uso.id) ?? uso);
    const possuiPendenciaHoje = usosHoje.some((uso) => uso.status === 'pendente' || uso.status === 'naoConfirmado');
    const ultimoUso = historico[0] ?? null;

    return {
        id: registro.id,
        nome: registro.nome,
        tipo: registro.tipo,
        horarios: registro.horariosProgramados,
        frequenciaId,
        dataPrimeiroUso: dataCivil(registro.dataInicioUso),
        dataValidade: dataCivil(registro.dataValidade),
        ...apresentarValidade(registro, agora, fusoHorario),
        intensidadeAlerta: registro.nivelIntensidadeAlerta,
        periodosPausa: registro.periodosPausa,
        proximoUsoPrevisto: timestamp(proximoUsoListagem(registro, agora, fusoHorario)),
        criadoEm: timestamp(registro.criadoEm),
        ativo: registro.ativo !== false,
        removidoEm: timestamp(registro.removidoEm),
        statusUltimoUso: possuiPendenciaHoje ? 'pendente' : (usosHoje.at(-1)?.status ?? ultimoUso?.estado ?? null),
        historico,
        usosHoje
    };
}

function ordenarAnticoncepcionaisListagem(registros) {
    return registros.sort((a, b) => {
        if (a.ativo !== b.ativo) return a.ativo ? -1 : 1;
        const instanteA = a.proximoUsoPrevisto ?? (a.dataValidade ? `${a.dataValidade}T00:00:00.000Z` : null);
        const instanteB = b.proximoUsoPrevisto ?? (b.dataValidade ? `${b.dataValidade}T00:00:00.000Z` : null);
        return (instanteA ? Date.parse(instanteA) : Infinity) - (instanteB ? Date.parse(instanteB) : Infinity)
            || (Date.parse(b.criadoEm) - Date.parse(a.criadoEm))
            || a.id - b.id;
    });
}

export {
    apresentarAnticoncepcionalListagem,
    apresentarUsoDoDia,
    apresentarUsoHistorico,
    ordenarAnticoncepcionaisListagem
};
