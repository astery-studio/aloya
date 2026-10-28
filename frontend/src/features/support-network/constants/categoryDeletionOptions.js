//Centraliza as decisões aceitas pelo backend durante a exclusão de uma categoria.
const ACOES_EXCLUSAO_CATEGORIA = Object.freeze({
    removerAcesso: 'remover_acesso',
    manterAcessoIndividual: 'manter_acesso_individual'
});

const acoesExclusaoPermitidas = new Set(Object.values(ACOES_EXCLUSAO_CATEGORIA));

function acaoExclusaoEhValida(acao) {
    return acoesExclusaoPermitidas.has(acao);
}

export { ACOES_EXCLUSAO_CATEGORIA, acaoExclusaoEhValida };
