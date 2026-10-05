const DIA_EM_MS = 86_400_000;

function paraDataCalendario(valor) {
    const texto = valor instanceof Date
        ? valor.toISOString().slice(0, 10)
        : valor;
    return new Date(`${texto}T00:00:00.000Z`);
}

function formatarData(data) {
    return data.toISOString().slice(0, 10);
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
