const estadoInicial = Object.freeze({
    valores: null,
    valoresIniciais: null,
    carregando: true,
    salvando: false,
    erroCarregamento: false,
    erroSalvar: null,
    sucesso: false
});

function cycleParametersReducer(estado, acao) {
    switch (acao.tipo) {
        case 'CARREGAR':
            return { ...estado, carregando: true, erroCarregamento: false };
        case 'CARREGADO':
            return {
                ...estado,
                valores: acao.parametros,
                valoresIniciais: acao.parametros,
                carregando: false,
                erroCarregamento: false
            };
        case 'FALHA_CARREGAMENTO':
            return { ...estado, carregando: false, erroCarregamento: true };
        case 'ALTERAR':
            return {
                ...estado,
                valores: { ...estado.valores, [acao.campo]: acao.valor }
            };
        case 'SALVAR':
            return { ...estado, salvando: true, erroSalvar: null };
        case 'SALVO':
            return {
                ...estado,
                valores: acao.parametros,
                valoresIniciais: acao.parametros,
                salvando: false,
                sucesso: true
            };
        case 'FALHA_SALVAMENTO':
            return { ...estado, salvando: false, erroSalvar: acao.mensagem };
        case 'FECHAR_SUCESSO':
            return { ...estado, sucesso: false };
        case 'FECHAR_ERRO':
            return { ...estado, erroSalvar: null };
        default:
            return estado;
    }
}

export { cycleParametersReducer, estadoInicial };
