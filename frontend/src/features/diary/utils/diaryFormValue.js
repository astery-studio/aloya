function alternarOpcao(valor, opcaoId) {
    const atuais = Array.isArray(valor) ? valor : [];
    return atuais.includes(opcaoId) ? atuais.filter((id) => id !== opcaoId) : [...atuais, opcaoId];
}

function categoriaPreenchida(categoria, valor) {
    if (categoria.tipoValor === 'opcoes') return Array.isArray(valor) && valor.length > 0;
    if (categoria.tipoValor === 'texto')
        return typeof valor === 'string' && valor.trim().length > 0;
    if (categoria.tipoValor === 'duracao_minutos') return Number.isSafeInteger(valor) && valor > 0;
    return typeof valor === 'string' && /^\d+(?:[.,]\d)?$/.test(valor);
}

function validarValorCategoria(categoria, valor) {
    if (!categoriaPreenchida(categoria, valor)) return null;
    if (categoria.id === 'temperatura_basal') {
        const numero = Number(valor.replace(',', '.'));
        return numero >= 32 && numero <= 42
            ? null
            : 'Informe uma temperatura entre 32,0 e 42,0 °C.';
    }
    if (categoria.tipoValor === 'texto' && [...valor].length > categoria.limiteCaracteres) {
        return `O texto deve possuir no máximo ${categoria.limiteCaracteres} caracteres.`;
    }
    return null;
}

function montarCategoriaPayload(categoria, valor) {
    if (!categoriaPreenchida(categoria, valor)) return null;
    if (categoria.tipoValor === 'opcoes') return { categoriaId: categoria.id, opcoes: valor };
    if (categoria.tipoValor === 'texto') return { categoriaId: categoria.id, texto: valor };
    if (categoria.tipoValor === 'duracao_minutos') {
        return { categoriaId: categoria.id, duracaoMinutos: valor };
    }
    return {
        categoriaId: categoria.id,
        valor: valor.replace(',', '.'),
        ...(categoria.id === 'temperatura_basal' ? { perturbada: false } : {})
    };
}

export { alternarOpcao, categoriaPreenchida, montarCategoriaPayload, validarValorCategoria };
