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

// Compara o que efetivamente seria persistido, ignorando ordem visual e fuso horário.
function criarAssinaturaFormulario({ catalogo, valores, data, hoje }) {
    const formulario = prepararFormularioDiario({ catalogo, valores, data, hoje });
    const categorias = formulario.dados.categorias
        .map(normalizarCategoria)
        .sort((primeira, segunda) => primeira.categoriaId.localeCompare(segunda.categoriaId));

    return JSON.stringify({ data, categorias });
}

export { criarAssinaturaFormulario, criarValoresIniciaisEdicao };
