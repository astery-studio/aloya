const FORMATO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

function decomporData(data) {
    const partes = typeof data === 'string' ? FORMATO_DATA.exec(data) : null;
    if (!partes) return null;
    const ano = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3]);
    const criada = new Date(Date.UTC(ano, mes - 1, dia));
    if (
        criada.getUTCFullYear() !== ano ||
        criada.getUTCMonth() !== mes - 1 ||
        criada.getUTCDate() !== dia
    )
        return null;
    return { ano, mes, dia, criada };
}

function formatarDataDiario(data) {
    const partes = decomporData(data);
    if (!partes) return '';
    return `${String(partes.dia).padStart(2, '0')}/${String(partes.mes).padStart(2, '0')}/${partes.ano}`;
}

function deslocarDataDiario(data, dias) {
    const partes = decomporData(data);
    if (!partes || !Number.isSafeInteger(dias)) return null;
    partes.criada.setUTCDate(partes.criada.getUTCDate() + dias);
    return partes.criada.toISOString().slice(0, 10);
}

function obterHojeDiario(agora = new Date()) {
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

export { decomporData, deslocarDataDiario, formatarDataDiario, obterHojeDiario };
