function selecionarIntervalo(selecao, data, hoje) {
    const valor = new Date(`${data}T00:00:00Z`);
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
        !Number.isFinite(valor.getTime()) ||
        valor.toISOString().slice(0, 10) !== data ||
        data > hoje
    )
        return selecao;
    if (!selecao.length) return [data];
    if (selecao.length === 1 && selecao[0] === data) return [];
    const [inicio, fim] = [selecao[0], data].sort();
    const dias =
        (Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) / 86400000 + 1;
    if (dias > 366) return selecao;
    return Array.from({ length: dias }, (_, indice) =>
        new Date(Date.parse(`${inicio}T00:00:00Z`) + indice * 86400000).toISOString().slice(0, 10)
    );
}
export { selecionarIntervalo };
