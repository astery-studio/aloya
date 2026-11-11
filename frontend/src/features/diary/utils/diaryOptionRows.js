const LARGURA_LINHA = 294;
const LARGURA_OPCAO_SOZINHA = 205;
const ESPACO_ENTRE_OPCOES = 5;
const PREFIXO_COLICAS = 'sintomas_fisicos_sintomas_colicas_';

function estimarLarguraOpcao(opcao) {
    return 38 + [...opcao.nome].length * 6;
}

function distribuir(opcoes, linhas) {
    let linha = [];
    let largura = 0;
    for (const opcao of opcoes) {
        const larguraOpcao = estimarLarguraOpcao(opcao);
        const cabe =
            largura + (linha.length ? ESPACO_ENTRE_OPCOES : 0) + larguraOpcao <= LARGURA_LINHA;
        if (!cabe || larguraOpcao >= LARGURA_OPCAO_SOZINHA) {
            if (linha.length) linhas.push(linha);
            linha = [];
            largura = 0;
        }
        if (larguraOpcao >= LARGURA_OPCAO_SOZINHA) linhas.push([opcao]);
        else {
            linha.push(opcao);
            largura += (linha.length > 1 ? ESPACO_ENTRE_OPCOES : 0) + larguraOpcao;
        }
    }
    if (linha.length) linhas.push(linha);
}

function organizarOpcoesEmLinhas(opcoes) {
    const linhas = [];
    const colicas = opcoes.filter((opcao) => opcao.id.startsWith(PREFIXO_COLICAS));
    const restantes = opcoes.filter((opcao) => !opcao.id.startsWith(PREFIXO_COLICAS));
    if (colicas.length) distribuir(colicas, linhas);
    distribuir(restantes, linhas);
    return linhas;
}

export { organizarOpcoesEmLinhas };
