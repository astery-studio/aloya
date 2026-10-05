const DIA_EM_MS = 86_400_000;

function preencherDoisDigitos(valor) {
    return String(valor).padStart(2, '0');
}

function formatarData(valor) {
    if (typeof valor === 'string') {
        return valor.slice(0, 10);
    }

    const estaNormalizadaEmUtc = valor.getUTCHours() === 0
        && valor.getUTCMinutes() === 0
        && valor.getUTCSeconds() === 0
        && valor.getUTCMilliseconds() === 0;
    const ano = estaNormalizadaEmUtc
        ? valor.getUTCFullYear()
        : valor.getFullYear();
    const mes = estaNormalizadaEmUtc
        ? valor.getUTCMonth() + 1
        : valor.getMonth() + 1;
    const dia = estaNormalizadaEmUtc
        ? valor.getUTCDate()
        : valor.getDate();

    return `${ano}-${preencherDoisDigitos(mes)}-${preencherDoisDigitos(dia)}`;
}

function paraDataCalendario(valor) {
    const [ano, mes, dia] = formatarData(valor).split('-').map(Number);
    return new Date(Date.UTC(ano, mes - 1, dia));
}

function adicionarDias(valor, quantidade) {
    const data = paraDataCalendario(valor);
    data.setUTCDate(data.getUTCDate() + quantidade);
    return formatarData(data);
}

function diferencaDias(inicio, fim) {
    return Math.round(
        (paraDataCalendario(fim) - paraDataCalendario(inicio)) / DIA_EM_MS
    );
}

export {
    adicionarDias,
    diferencaDias,
    formatarData,
    paraDataCalendario
};
