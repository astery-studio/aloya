function criarAparenciaErroInterno(tema) {
    if (!tema.escuro) return {};
    return {
        modal: {
            borderRadius: 20,
            backgroundColor: '#1E1E1E',
            boxShadow: '0 8px 40px 0 rgba(34, 34, 34, 0.12)'
        },
        cabecalho: { backgroundColor: '#1E1E1E' }
    };
}

export { criarAparenciaErroInterno };
