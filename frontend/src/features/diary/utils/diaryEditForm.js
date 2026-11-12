import { prepararFormularioDiario } from './diaryForm';

// Converte o contrato de detalhe da API para os valores controlados pelo formulário.
function criarValoresIniciaisEdicao(registro) {
    if (!Array.isArray(registro?.categorias)) return {};

    return registro.categorias.reduce((valores, categoria) => {
        if (!categoria || typeof categoria.id !== 'string' || !categoria.id) return valores;

        if (Array.isArray(categoria.opcoes)) {
            valores[categoria.id] = categoria.opcoes
                .map((opcao) => opcao?.id)
                .filter((id) => typeof id === 'string' && id);
        } else if (typeof categoria.texto === 'string') {
            valores[categoria.id] = categoria.texto;
        } else if (Number.isSafeInteger(categoria.duracaoMinutos)) {
            valores[categoria.id] = categoria.duracaoMinutos;
        } else if (typeof categoria.valor === 'string') {
            valores[categoria.id] = categoria.valor;
        }

        return valores;
    }, {});
}

function normalizarCategoria(categoria) {
    const normalizada = { ...categoria };
    if (Array.isArray(normalizada.opcoes)) {
        normalizada.opcoes = [...normalizada.opcoes].sort();
    }
    return normalizada;
}

function converterCategoriaDoDetalhe(categoria) {
    if (!categoria || typeof categoria.id !== 'string' || !categoria.id) return null;
    if (Array.isArray(categoria.opcoes) && categoria.opcoes.length > 0) {
        return {
            categoriaId: categoria.id,
            opcoes: categoria.opcoes.map(({ id }) => id).filter(Boolean)
        };
    }
    if (typeof categoria.texto === 'string' && categoria.texto.length > 0) {
        return { categoriaId: categoria.id, texto: categoria.texto };
    }
    if (Number.isSafeInteger(categoria.duracaoMinutos)) {
        return { categoriaId: categoria.id, duracaoMinutos: categoria.duracaoMinutos };
    }
    if (typeof categoria.valor !== 'string' || !categoria.valor) return null;
    return {
        categoriaId: categoria.id,
        valor: categoria.valor,
        ...(categoria.id === 'temperatura_basal'
            ? {
                  perturbada: categoria.perturbada === true,
                  ...(categoria.perturbada && categoria.motivoPerturbacao
                      ? { motivoPerturbacao: categoria.motivoPerturbacao }
                      : {})
              }
            : {})
    };
}

function criarCategoriasInativasPreservadas(catalogo, registro) {
    const categoriasAtivas = new Set(
        (catalogo?.macrocategorias ?? []).flatMap((macro) =>
            macro.ativa
                ? macro.categorias
                      .filter((categoria) => categoria.ativaEfetiva)
                      .map((categoria) => categoria.id)
                : []
        )
    );
    return (registro?.categorias ?? [])
        .filter((categoria) => !categoriasAtivas.has(categoria?.id))
        .map(converterCategoriaDoDetalhe)
        .filter(Boolean);
}

// Compara o que efetivamente seria persistido, ignorando ordem visual e fuso horário.
function criarAssinaturaFormulario({ catalogo, valores, data, hoje }) {
    const formulario = prepararFormularioDiario({ catalogo, valores, data, hoje });
    const categorias = formulario.dados.categorias
        .map(normalizarCategoria)
        .sort((primeira, segunda) => primeira.categoriaId.localeCompare(segunda.categoriaId));

    return JSON.stringify({ data, categorias });
}

export {
    converterCategoriaDoDetalhe,
    criarAssinaturaFormulario,
    criarCategoriasInativasPreservadas,
    criarValoresIniciaisEdicao
};
