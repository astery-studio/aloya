function obterReferenciaFolicular(medicoes, dataLimite, quantidade) {
    const validas = medicoes
        .filter(({ data, perturbada }) => data <= dataLimite && !perturbada)
        .sort((a, b) => a.valorDecimos - b.valorDecimos || a.data.localeCompare(b.data));
    return validas.length < quantidade ? null : validas.slice(0, quantidade);
}

export { obterReferenciaFolicular };
