const espacamentos = Object.freeze({
    minimo: 4,
    pequeno: 8,
    medio: 16,
    grande: 24,
    extraGrande: 32,
    maximo: 48
});

const espacamentosLayout = Object.freeze({
    margemHorizontalTela: espacamentos.grande,
    espacamentoEntreColunas: espacamentos.medio,
    espacamentoSuperiorHeader: espacamentos.medio,
    espacamentoInferiorHeader: espacamentos.medio,
    headerParaConteudo: espacamentos.pequeno,
    descricaoParaConteudo: espacamentos.grande
});

export { espacamentos, espacamentosLayout };
