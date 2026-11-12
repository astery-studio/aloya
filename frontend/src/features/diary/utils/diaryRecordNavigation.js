// Localiza os registros vizinhos na coleção ordenada do mais recente para o mais antigo.
function obterRegistrosAdjacentes(registros = [], registroId) {
    if (!Array.isArray(registros) || !Number.isSafeInteger(registroId)) {
        return { anterior: null, proximo: null };
    }
    const indiceAtual = registros.findIndex((registro) => registro?.id === registroId);
    if (indiceAtual < 0) return { anterior: null, proximo: null };
    return {
        anterior: registros[indiceAtual + 1] ?? null,
        proximo: indiceAtual > 0 ? registros[indiceAtual - 1] : null
    };
}

export { obterRegistrosAdjacentes };
