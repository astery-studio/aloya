function mediana(valores) {
    const ordenados = [...valores].sort((a, b) => a - b);
    const meio = Math.floor(ordenados.length / 2);
    return ordenados.length % 2
        ? ordenados[meio]
        : Math.round((ordenados[meio - 1] + ordenados[meio]) / 2);
}

export { mediana };
