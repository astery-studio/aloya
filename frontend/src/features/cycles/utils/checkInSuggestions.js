import { listarMacrocategoriasAtivas } from '../../diary/utils/diaryForm';
import { sugestoesPadraoPorFase } from '../constants/checkInDefaults';

const LIMITE_SUGESTOES = 8;
const CATEGORIAS_CHECK_IN = new Set([
    'fluxo_menstrual',
    'sintomas_fisicos',
    'sintomas_emocionais',
    'sintomas_pre_menstruais'
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
        listarMacrocategoriasAtivas(catalogo)
            .flatMap((macro) => macro.categorias)
            .filter(({ id }) => CATEGORIAS_CHECK_IN.has(id))
            .map((categoria) => [categoria.id, categoria])
    );
    const personalizadas = destaques
        .filter(({ categoriaId }) => CATEGORIAS_CHECK_IN.has(categoriaId))
        .map(({ categoriaId, valor }) => [categoriaId, valor]);
    const candidatas = [...personalizadas, ...(sugestoesPadraoPorFase[fase] ?? [])];
    const idsIncluidos = new Set();
    const sugestoes = [];

    for (const [categoriaId, nome] of candidatas) {
        const encontrada = localizarOpcao(categorias, categoriaId, nome);
        if (!encontrada || idsIncluidos.has(encontrada.opcao.id)) continue;
        idsIncluidos.add(encontrada.opcao.id);
        sugestoes.push(encontrada);
        if (sugestoes.length === LIMITE_SUGESTOES) break;
    }
    return sugestoes;
}

export { criarSugestoesCheckIn, LIMITE_SUGESTOES };
