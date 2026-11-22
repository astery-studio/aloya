const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function paraDataUtc(data) {
    if (!FORMATO_DATA.test(data)) throw new TypeError('Data térmica inválida.');
    const instante = new Date(`${data}T00:00:00.000Z`);
    if (instante.toISOString().slice(0, 10) !== data) {
        throw new TypeError('Data térmica inválida.');
    }
    return instante;
}

function adicionarDias(data, quantidade) {
    const instante = paraDataUtc(data);
    instante.setUTCDate(instante.getUTCDate() + quantidade);
    return instante.toISOString().slice(0, 10);
}

export { adicionarDias };
