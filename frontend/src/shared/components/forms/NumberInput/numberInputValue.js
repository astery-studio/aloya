function sanitizarEntradaNumerica(texto, casasDecimais = 0, maximoDigitosInteiros = 2) {
    const entrada = String(texto ?? '')
        .replace('.', ',')
        .replace(/[^\d,]/g, '');
    const separador = entrada.indexOf(',');
    const inteiroBruto = separador < 0 ? entrada : entrada.slice(0, separador);
    const inteiro = inteiroBruto.slice(0, maximoDigitosInteiros);

    if (casasDecimais <= 0 || separador < 0) return inteiro;

    const fracao = entrada
        .slice(separador + 1)
        .replace(/,/g, '')
        .slice(0, casasDecimais);
    return `${inteiro || '0'},${fracao}`;
}

function converterEntradaNumerica(texto, casasDecimais = 0, maximoDigitosInteiros = 2) {
    const sanitizado = sanitizarEntradaNumerica(texto, casasDecimais, maximoDigitosInteiros);
    if (!sanitizado) return null;
    return casasDecimais > 0 ? sanitizado : Number(sanitizado);
}

export { converterEntradaNumerica, sanitizarEntradaNumerica };
