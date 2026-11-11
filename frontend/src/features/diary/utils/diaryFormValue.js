function alternarOpcao(valor, opcaoId) {
    const atuais = Array.isArray(valor) ? valor : [];
    return atuais.includes(opcaoId) ? atuais.filter((id) => id !== opcaoId) : [...atuais, opcaoId];
}

const gruposExclusivosCiclo = new Set([
    'fluxo_menstrual:intensidade',
    'fluxo_menstrual:coagulos',
    'fluxo_menstrual:aspecto',
    'sangramento_escape:cor',
    'sangramento_escape:intensidade',
    'secrecao_corrimento:presenca',
    'secrecao_corrimento:consistencia',
    'secrecao_corrimento:cor'
]);
const opcoesOdor = new Set([
    'secrecao_corrimento_caracteristicas_sem_odor',
    'secrecao_corrimento_caracteristicas_odor_diferente_do_habitual',
    'secrecao_corrimento_caracteristicas_odor_forte'
]);

function alternarOpcaoCategoria(categoria, valor, opcao) {
    const atuais = Array.isArray(valor) ? valor : [];
    if (atuais.includes(opcao.id)) return atuais.filter((id) => id !== opcao.id);
    const grupoExclusivo = gruposExclusivosCiclo.has(`${categoria.id}:${opcao.grupo}`);
    const idsExclusivos = grupoExclusivo
        ? categoria.opcoes.filter((item) => item.grupo === opcao.grupo).map((item) => item.id)
        : opcoesOdor.has(opcao.id)
          ? [...opcoesOdor]
          : [];
    return [...atuais.filter((id) => !idsExclusivos.includes(id)), opcao.id];
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

export {
    alternarOpcao,
    alternarOpcaoCategoria,
    categoriaPreenchida,
    montarCategoriaPayload,
    validarValorCategoria
};
