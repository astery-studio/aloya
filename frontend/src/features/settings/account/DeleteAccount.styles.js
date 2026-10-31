function criarAparencia(tema) {
    if (!tema.escuro) return {};
    return {
        fundoIcone: 'rgba(239, 154, 154, 0.12)',
        corIcone: '#EF9A9A',
        icone: { borderRadius: 24 },
        senha: {
            campo: {
                borderRadius: 12,
                borderWidth: 1.41,
                borderColor: 'rgba(255, 255, 255, 0.12)',
                backgroundColor: '#2C2C2C'
            },
            campoFocado: { borderColor: '#EF9A9A' },
            textoFocado: { color: '#E3E3E3' },
            texto: { color: '#75757580' },
            corIcone: '#75757580',
            corPlaceholder: '#75757580'
        },
        botaoPrincipalDesativado: { borderRadius: 12, backgroundColor: '#2C2C2C' },
        textoPrincipalDesativado: { color: '#757575' },
        botaoPrincipal: { borderRadius: 12, backgroundColor: '#EF9A9A' },
        textoPrincipal: { color: '#121212' },
        botaoSecundario: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.12)',
            backgroundColor: '#242424'
        },
        textoSecundario: { color: '#E3E3E3' },
        modal: {
            borderRadius: 20,
            backgroundColor: '#1E1E1E',
            boxShadow: '0 8px 40px 0 rgba(34, 34, 34, 0.12)'
        }
    };
}

export { criarAparencia };
