import { CONFIGURACAO_TERMICA_SOMBRA } from './thermal.config.js';
import { adicionarDias } from './thermal.dates.js';

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

function avaliarJanela(porData, data, config) {
    const inicioReferencia = adicionarDias(data, -config.quantidadeReferencia);
    const referencia = obterValidasConsecutivas(
        porData,
        inicioReferencia,
        config.quantidadeReferencia
    );
    const elevadas = obterValidasConsecutivas(porData, data, config.quantidadeElevada);
    if (!referencia || !elevadas) return { avaliavel: false };

    const soma = referencia.reduce((total, item) => total + item.valorDecimos, 0);
    const limiteMultiplicado = soma + config.elevacaoDecimos * config.quantidadeReferencia;
    const confirmou = elevadas.every(
        ({ valorDecimos }) => config.quantidadeReferencia * valorDecimos >= limiteMultiplicado
    );
    return {
        avaliavel: true,
        confirmou,
        limiteMultiplicado,
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
        const janela = avaliarJanela(porData, data, config);
        if (janela.avaliavel) janelasAvaliaveis += 1;
        if (janela.confirmou) {
            sequencias.push(janela.sequencia);
            break;
        }
    }

    const estado =
        sequencias.length === 1
            ? 'ELEVACAO_DETECTADA'
            : janelasAvaliaveis > 0
              ? 'NENHUMA_ELEVACAO_DETECTADA'
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
