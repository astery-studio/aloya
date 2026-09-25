import { obterFrequencia } from './contraceptive.constants.js';
import { calcularProximoUso } from './contraceptive.schedule.js';

const IDENTIFICADORES_FREQUENCIA = Object.freeze({
    pilula: { uso_21_dias_pausa_7_dias: 'pilula_21_7', uso_24_dias_pausa_4_dias: 'pilula_24_4', uso_12_semanas_pausa_1_semana: 'pilula_12_1', uso_continuo: 'pilula_continuo' },
    injetavel: { aplicacao_mensal: 'injetavel_mensal', aplicacao_bimestral: 'injetavel_bimestral', aplicacao_trimestral: 'injetavel_trimestral' },
    adesivo: { uso_continuo: 'adesivo_continuo', uso_3_semanas_pausa_1_semana: 'adesivo_3_1' },
    anel_vaginal: { uso_21_dias: 'anel_21', uso_28_dias: 'anel_28', uso_3_semanas_pausa_1_semana: 'anel_3_1' }
});

function apresentarAnticoncepcional(registro, agora = new Date()) {
    const frequenciaId = IDENTIFICADORES_FREQUENCIA[registro.tipo]?.[registro.frequencia] ?? null;
    const regra = frequenciaId ? obterFrequencia(registro.tipo, frequenciaId) : null;
    const proximoUso = regra ? calcularProximoUso({
        horarios: registro.horariosProgramados,
        dataPrimeiroUso: registro.dataInicioUso,
        regra,
        periodosPausa: registro.periodosPausa
    }, agora) : null;

    return {
        id: registro.id,
        nome: registro.nome,
        tipo: registro.tipo,
        horarios: registro.horariosProgramados,
        frequenciaId,
        dataPrimeiroUso: registro.dataInicioUso?.toISOString().slice(0, 10) ?? null,
        dataValidade: registro.dataValidade?.toISOString().slice(0, 10) ?? null,
        intensidadeAlerta: registro.nivelIntensidadeAlerta,
        periodosPausa: registro.periodosPausa,
        proximoUsoPrevisto: proximoUso?.toISOString() ?? null,
        criadoEm: registro.criadoEm.toISOString()
    };
}

export { apresentarAnticoncepcional };
