//Cria os limites UTC exatos de um mês sem depender do fuso horário do servidor.
const DIA_EM_MS = 86_400_000;

function criarDataUtc(ano, indiceMes) {
    const data = new Date(0);
    data.setUTCHours(0, 0, 0, 0);
    data.setUTCFullYear(ano, indiceMes, 1);
    return data;
}

function criarIntervaloMensal(entrada) {
    const ehObjeto = entrada !== null && typeof entrada === 'object' && !Array.isArray(entrada);

    if (!ehObjeto) {
        throw new TypeError('Intervalo mensal inválido.');
    }

    const {ano, mes} = entrada;
    const anoValido = Number.isSafeInteger(ano) && ano >= 1 && ano <= 9999;
    const mesValido = Number.isSafeInteger(mes) && mes >= 1 && mes <= 12;

    if (!anoValido || !mesValido) {
        throw new TypeError('Intervalo mensal inválido.');
    }

    const inicioMes = criarDataUtc(ano, mes - 1);
    const fimMesExclusivo = criarDataUtc(ano, mes);
    const ultimoInstante = new Date(fimMesExclusivo.getTime() - DIA_EM_MS);

    return {
        inicioMes,
        fimMesExclusivo,
        ultimoDia: ultimoInstante.toISOString().slice(0, 10)
    };
}

export { criarIntervaloMensal };