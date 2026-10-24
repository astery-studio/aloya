// Mantém a data programada independente do fuso horário de timestamps da API.
function partesDaDataUso(valor) {
    if (typeof valor !== 'string') return null;

    const iso = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(valor);
    const brasileira = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
    if (!iso && !brasileira) return null;

    const [ano, mes, dia] = iso
        ? iso.slice(1).map(Number)
        : [brasileira[3], brasileira[2], brasileira[1]].map(Number);
    const data = new Date(Date.UTC(ano, mes - 1, dia));
    if (data.getUTCFullYear() !== ano || data.getUTCMonth() + 1 !== mes || data.getUTCDate() !== dia) {
        return null;
    }

    return { ano, mes, dia, chaveMes: `${ano}-${String(mes).padStart(2, '0')}` };
}

function formatarDataUso(valor) {
    const partes = partesDaDataUso(valor);
    return partes
        ? `${String(partes.dia).padStart(2, '0')}/${String(partes.mes).padStart(2, '0')}/${partes.ano}`
        : valor;
}

function estadoCalendarioUso(estado) {
    if (['foraDoPrazo', 'confirmadoForaDoPrazo', 'confirmadoForaPrazoHistoricoUso'].includes(estado)) {
        return 'foraDoPrazo';
    }
    if (['naoConfirmado', 'nao_confirmado', 'nãoConfirmado', 'Não confirmado', 'naoConfirmadoHistoricoUso'].includes(estado)) {
        return 'naoConfirmado';
    }
    if (['confirmado', 'Confirmado', 'confirmadoHistorico', 'confirmadoHistoricoUso'].includes(estado)) {
        return 'confirmado';
    }
    return null;
}

function estadoRegistroUso(registro) {
    const estado = estadoCalendarioUso(registro.estado ?? registro.status ?? registro.statusUso);
    if (estado === 'confirmado' && (registro.foraDoPrazo || registro.confirmacaoForaPrazo)) return 'foraDoPrazo';
    return estado;
}

export { partesDaDataUso, formatarDataUso, estadoCalendarioUso, estadoRegistroUso };
