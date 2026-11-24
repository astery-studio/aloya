import { sugestoesPadraoPorFase } from '../constants/checkInDefaults';

const LIMITE_SUGESTOES = 8;
const LIMITE_POR_CATEGORIA = 2;
const CATEGORIAS_CHECK_IN = new Set([
    'fluxo_menstrual',
    'sintomas_fisicos',
    'sintomas_emocionais',
    'sintomas_pre_menstruais',
    'energia',
    'qualidade_sono',
    'digestao',
    'pele'
]);

function localizarOpcao(categorias, categoriaId, nome) {
    const categoria = categorias.get(categoriaId);
    const opcao = categoria?.opcoes.find(
        ({ nome: nomeOpcao }) =>
            nomeOpcao.localeCompare(nome, 'pt-BR', { sensitivity: 'base' }) === 0
    );
    return opcao ? { categoria, opcao } : null;
}

function criarSugestoesCheckIn({ catalogo, fase, destaques = [] }) {
    const categorias = new Map(
        (catalogo?.macrocategorias ?? [])
            .flatMap((macro) => macro.categorias)
            .filter(({ id }) => CATEGORIAS_CHECK_IN.has(id))
            .map((categoria) => [categoria.id, categoria])
    );
    const personalizadas = destaques
        .filter(({ categoriaId }) => CATEGORIAS_CHECK_IN.has(categoriaId))
        .map(({ categoriaId, valor }) => [categoriaId, valor]);
    const reservasAtivas = [...categorias.values()]
        .filter(({ id }) => fase === 'menstrual' || id !== 'fluxo_menstrual')
        .flatMap((categoria) => categoria.opcoes.map(({ nome }) => [categoria.id, nome]));
    const candidatas = [
        ...personalizadas,
        ...(sugestoesPadraoPorFase[fase] ?? []),
        ...reservasAtivas
    ];
    const idsIncluidos = new Set();
    const quantidadePorCategoria = new Map();
    const sugestoes = [];

    for (const [categoriaId, nome] of candidatas) {
        const encontrada = localizarOpcao(categorias, categoriaId, nome);
        const quantidade = quantidadePorCategoria.get(categoriaId) ?? 0;
        if (
            !encontrada ||
            idsIncluidos.has(encontrada.opcao.id) ||
            quantidade >= LIMITE_POR_CATEGORIA
        )
            continue;
        idsIncluidos.add(encontrada.opcao.id);
        quantidadePorCategoria.set(categoriaId, quantidade + 1);
        sugestoes.push(encontrada);
        if (sugestoes.length === LIMITE_SUGESTOES) break;
    }
    return sugestoes;
}

export { criarSugestoesCheckIn, LIMITE_POR_CATEGORIA, LIMITE_SUGESTOES };
