function obterReferenciaFolicular(medicoes, dataLimite, quantidade) {
    const ordenadas = medicoes
        .filter(({ data }) => data <= dataLimite)
        .sort((a, b) => a.data.localeCompare(b.data));
    const janelas = [];
    for (let inicio = 0; inicio <= ordenadas.length - quantidade; inicio += 1) {
        const janela = ordenadas.slice(inicio, inicio + quantidade);
        const consecutiva = janela.every(
            (item, indice) =>
                !item.perturbada &&
                (indice === 0 ||
                    Date.parse(item.data) - Date.parse(janela[indice - 1].data) === 86_400_000)
        );
        if (consecutiva) janelas.push(janela);
    }
    janelas.sort(
        (a, b) =>
            a.reduce((total, item) => total + item.valorDecimos, 0) -
                b.reduce((total, item) => total + item.valorDecimos, 0) ||
            a[0].data.localeCompare(b[0].data)
    );
    return janelas[0] ?? null;
}

export { obterReferenciaFolicular };
