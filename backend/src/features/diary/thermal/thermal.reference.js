import { adicionarDias } from './thermal.dates.js';

function obterReferencia(medicoes, data, config) {
    if (config.disponibilidade === 'B1') {
        const porData = new Map(medicoes.map((medicao) => [medicao.data, medicao]));
        const referencia = [];
        for (let dias = config.quantidadeReferencia; dias > 0; dias -= 1) {
            const medicao = porData.get(adicionarDias(data, -dias));
            if (!medicao || medicao.perturbada) return null;
            referencia.push(medicao);
        }
        return referencia;
    }

    const inicio = adicionarDias(data, -config.janelaReferenciaDias);
    const validas = medicoes.filter(
        (medicao) => medicao.data >= inicio && medicao.data < data && !medicao.perturbada
    );
    return validas.length < config.quantidadeReferencia
        ? null
        : validas.slice(-config.quantidadeReferencia);
}

export { obterReferencia };
