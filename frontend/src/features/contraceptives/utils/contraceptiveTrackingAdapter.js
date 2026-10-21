// Adaptador exclusivo da listagem e do histórico HU-019/HU-023.
// Não altera o contrato do normalizador usado nos formulários HU-020/HU-021.
import { estadoRegistroUso } from './usageHistory';

function horarioDaConfirmacao(confirmadoEm) {
    if (typeof confirmadoEm !== 'string' || !confirmadoEm) return null;
    const instante = new Date(confirmadoEm);
    if (Number.isNaN(instante.getTime())) return null;
    return `${String(instante.getHours()).padStart(2, '0')}:${String(instante.getMinutes()).padStart(2, '0')}`;
}

function normalizarUsoAcompanhamento(uso) {
    const confirmadoEm = uso.confirmadoEm ?? null;
    const foraDoPrazo = Boolean(uso.foraDoPrazo ?? uso.confirmacaoForaPrazo);
    return Object.freeze({
        ...(uso.id !== undefined && uso.id !== null ? { id: String(uso.id) } : {}),
        data: uso.data,
        horario: uso.horario ?? uso.horarioProgramado,
        status: uso.status ?? uso.estado,
        confirmadoEm,
        // Sempre deriva do timestamp real recebido, nunca do relógio da tela.
        horarioConfirmacao: horarioDaConfirmacao(confirmadoEm),
        foraDoPrazo,
        confirmacaoForaPrazo: foraDoPrazo,
        ...(uso.prazoConfigurado !== undefined ? { prazoConfigurado: uso.prazoConfigurado } : {})
    });
}

function normalizarRegistroHistorico(registro) {
    return Object.freeze({
        ...(registro.id !== undefined && registro.id !== null ? { id: String(registro.id) } : {}),
        data: registro.data,
        horarioProgramado: registro.horarioProgramado ?? registro.horario,
        estado: estadoRegistroUso(registro) ?? registro.estado ?? registro.status,
        confirmadoEm: registro.confirmadoEm ?? null,
        horarioConfirmacao: horarioDaConfirmacao(registro.confirmadoEm)
    });
}

function normalizarAcompanhamentoAnticoncepcional(registro, anticoncepcionalNormalizado) {
    const removido = registro.ativo === false || Boolean(registro.removidoEm);
    return Object.freeze({
        ...anticoncepcionalNormalizado,
        ativo: !removido,
        removido,
        removidoEm: registro.removidoEm ?? null,
        statusUltimoUso: registro.statusUltimoUso ?? null,
        usosHoje: Object.freeze((registro.usosHoje ?? []).map(normalizarUsoAcompanhamento)),
        historico: Object.freeze((registro.historico ?? []).map(normalizarRegistroHistorico)),
        ...(registro.validadeExpirada !== undefined ? { validadeExpirada: registro.validadeExpirada } : {}),
        ...(registro.validadeRestante !== undefined ? { validadeRestante: registro.validadeRestante } : {})
    });
}

function mesmoUso(primeiro, segundo) {
    return primeiro.data === segundo.data
        && (primeiro.horario ?? primeiro.horarioProgramado) === (segundo.horario ?? segundo.horarioProgramado);
}

function atualizarUsoDoAnticoncepcional(item, uso) {
    const encontrado = (item.usosHoje ?? []).some((atual) => mesmoUso(atual, uso));
    const usosHoje = encontrado
        ? item.usosHoje.map((atual) => mesmoUso(atual, uso) ? uso : atual)
        : [...(item.usosHoje ?? []), uso];
    const registro = normalizarRegistroHistorico({
        ...uso,
        estado: uso.status === 'confirmado' && uso.foraDoPrazo ? 'foraDoPrazo' : uso.status
    });
    const historico = [...(item.historico ?? []).filter((atual) => !mesmoUso(atual, registro)), registro]
        .sort((a, b) => `${b.data} ${b.horarioProgramado}`.localeCompare(`${a.data} ${a.horarioProgramado}`));
    return { ...item, usosHoje, historico, statusUltimoUso: historico[0]?.estado ?? null };
}

function fusoDoDispositivo() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export {
    horarioDaConfirmacao,
    normalizarUsoAcompanhamento,
    normalizarRegistroHistorico,
    normalizarAcompanhamentoAnticoncepcional,
    mesmoUso,
    atualizarUsoDoAnticoncepcional,
    fusoDoDispositivo
};
