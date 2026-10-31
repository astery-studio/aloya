function criarAparenciaErroInterno(tema) {
    if (!tema.escuro) return {};
    return {
        icone: { borderRadius: 14 },
        fundoIcone: 'rgba(239, 154, 154, 0.12)',
        corIcone: '#EF9A9A',
        iconeCabecalho: { borderRadius: 14, backgroundColor: 'rgba(239, 154, 154, 0.12)' },
        corIconeCabecalho: '#EF9A9A',
        botaoPrincipal: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.38)',
            backgroundColor: 'rgba(255, 255, 255, 0.16)'
        },
        textoPrincipal: { color: '#FFFFFF' },
        modal: {
            borderRadius: 20,
            backgroundColor: '#1E1E1E',
            boxShadow: '0 8px 40px 0 rgba(34, 34, 34, 0.12)'
        },
        cabecalho: { backgroundColor: '#1E1E1E' }
    };
}

export { criarAparenciaErroInterno };
