import { adicionarDias } from './thermal.dates.js';

function encontrarRetorno(porData, aposData, ultimaData, referencia, regra) {
    if (!regra?.habilitado) return null;
    const soma = referencia.reduce((total, item) => total + item.valorDecimos, 0);
    let consecutivas = 0;
    for (let data = adicionarDias(aposData, 1); data <= ultimaData; data = adicionarDias(data, 1)) {
        const medicao = porData.get(data);
        const naLinhaBase =
            medicao &&
            !medicao.perturbada &&
            referencia.length * medicao.valorDecimos <=
                soma + regra.margemDecimos * referencia.length;
        consecutivas = naLinhaBase ? consecutivas + 1 : 0;
        if (consecutivas === regra.quantidadeConsecutiva) {
            return {
                dataInicio: adicionarDias(data, 1 - consecutivas),
                dataConfirmacao: data
            };
        }
    }
    return null;
}

export { encontrarRetorno };
