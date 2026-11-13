import { CONFIGURACAO_TERMICA_SOMBRA } from './thermal.config.js';
import { adicionarDias } from './thermal.dates.js';
import { obterReferencia } from './thermal.reference.js';
import { encontrarRetorno } from './thermal.return.js';
import { atingiuLimiar } from './thermal.threshold.js';

function indexarMedicoes(medicoes) {
    const ordenadas = [...medicoes].sort((a, b) => a.data.localeCompare(b.data));
    const porData = new Map();
    for (const medicao of ordenadas) {
        adicionarDias(medicao.data, 0);
        if (porData.has(medicao.data)) throw new TypeError('Medição térmica duplicada.');
        if (!Number.isSafeInteger(medicao.valorDecimos)) {
            throw new TypeError('Valor térmico inválido.');
        }
        porData.set(medicao.data, medicao);
    }
    return { ordenadas, porData };
}

function obterValidasConsecutivas(porData, inicio, quantidade) {
    const resultado = [];
    for (let deslocamento = 0; deslocamento < quantidade; deslocamento += 1) {
        const medicao = porData.get(adicionarDias(inicio, deslocamento));
        if (!medicao || medicao.perturbada) return null;
        resultado.push(medicao);
    }
    return resultado;
}

function avaliarJanela(medicoes, porData, data, config) {
    const referencia = obterReferencia(medicoes, data, config);
    const elevadas = obterValidasConsecutivas(porData, data, config.quantidadeElevada);
    if (!referencia || !elevadas) return { avaliavel: false };

    const soma = referencia.reduce((total, item) => total + item.valorDecimos, 0);
    const confirmou = elevadas.every(({ valorDecimos }) =>
        atingiuLimiar(referencia, valorDecimos, config)
    );
    return {
        avaliavel: true,
        confirmou,
        referencia,
        sequencia: confirmou
            ? {
                  dataInicioElevacao: data,
                  dataConfirmacao: adicionarDias(data, config.quantidadeElevada - 1),
                  referencia: {
                      datas: referencia.map(({ data: dia }) => dia),
                      somaDecimos: soma,
                      maximoDecimos: Math.max(...referencia.map(({ valorDecimos }) => valorDecimos))
                  }
              }
            : null
    };
}

function detectarPadraoTermico(medicoes, config = CONFIGURACAO_TERMICA_SOMBRA) {
    const { ordenadas, porData } = indexarMedicoes(medicoes);
    const ultimaData = ordenadas.at(-1)?.data;
    const sequencias = [];
    let janelasAvaliaveis = 0;

    for (let data = ordenadas[0]?.data; data && data <= ultimaData; data = adicionarDias(data, 1)) {
        const janela = avaliarJanela(ordenadas, porData, data, config);
        if (janela.avaliavel) janelasAvaliaveis += 1;
        if (janela.confirmou) {
            const retorno = encontrarRetorno(
                porData,
                janela.sequencia.dataConfirmacao,
                ultimaData,
                janela.referencia,
                config.retornoLinhaBase
            );
            janela.sequencia.retornoLinhaBase = retorno;
            sequencias.push(janela.sequencia);
            if (!retorno) break;
            data = retorno.dataConfirmacao;
        }
    }

    const estado =
        sequencias.length > 1
            ? 'INCONCLUSIVO'
            : sequencias.length === 1
              ? 'ELEVACAO_DETECTADA'
              : janelasAvaliaveis > 0
                ? 'NENHUMA_ELEVACAO_IDENTIFICADA'
                : 'DADOS_INSUFICIENTES';
    return {
        algoritmo: config.algoritmo,
        versao: config.versao,
        variante: config.variante,
        disponibilidade: config.disponibilidade,
        estado,
        provisorio: true,
        janelasAvaliaveis,
        sequencias,
        aplicarEvidenciaNaConfianca: false
    };
}

export { detectarPadraoTermico };
