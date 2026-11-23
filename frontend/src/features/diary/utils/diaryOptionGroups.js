function agruparOpcoes(opcoes = []) {
    const grupos = new Map();
    for (const opcao of opcoes) {
        if (!grupos.has(opcao.grupo)) grupos.set(opcao.grupo, []);
        grupos.get(opcao.grupo).push(opcao);
    }
    return [...grupos];
}

export { agruparOpcoes };
