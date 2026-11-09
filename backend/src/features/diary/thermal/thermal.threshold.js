function atingiuLimiar(referencia, valorDecimos, config) {
    const valores = referencia.map((medicao) => medicao.valorDecimos);
    if (config.referencia === 'maxima') {
        return valorDecimos >= Math.max(...valores) + config.elevacaoDecimos;
    }
    const soma = valores.reduce((total, valor) => total + valor, 0);
    return referencia.length * valorDecimos >=
        soma + config.elevacaoDecimos * referencia.length;
}

export { atingiuLimiar };
