import { adicionarDias } from './thermal.dates.js';
import { atingiuLimiar } from './thermal.threshold.js';

function encontrarSequenciaFixa(medicoes, inicio, fim, referencia, config) {
    const porData = new Map(medicoes.map((medicao) => [medicao.data, medicao]));
    let janelasAvaliaveis = 0;
    for (let data = inicio; data <= fim; data = adicionarDias(data, 1)) {
        const elevadas = [];
        for (let indice = 0; indice < config.quantidadeElevada; indice += 1) {
            const medicao = porData.get(adicionarDias(data, indice));
            if (!medicao || medicao.perturbada) break;
            elevadas.push(medicao);
        }
        if (elevadas.length !== config.quantidadeElevada) continue;
        janelasAvaliaveis += 1;
        if (elevadas.every(({ valorDecimos }) => atingiuLimiar(referencia, valorDecimos, config))) {
            return {
                janelasAvaliaveis,
                sequencia: {
                    dataInicioElevacao: data,
                    dataConfirmacao: adicionarDias(data, config.quantidadeElevada - 1)
                }
            };
        }
    }
    return { janelasAvaliaveis, sequencia: null };
}

export { encontrarSequenciaFixa };
