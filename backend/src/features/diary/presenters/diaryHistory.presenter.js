import { formatarData } from '../../cycles/utils/calendar.js';
import { CATEGORIAS_POR_ID, OPCOES_POR_ID } from '../catalog/diaryCatalog.lookup.js';
import { apresentarDecimal } from './diaryEntry.presenter.js';

const PRIORIDADE_MACRO = new Map([
    ['corpo_sintomas_fisicos', 0],
    ['emocional', 1]
]);

function criarCandidato(categoria, valor, ordem = 0) {
    const catalogo = CATEGORIAS_POR_ID.get(categoria.categoriaId);
    return {
        categoriaId: categoria.categoriaId,
        categoria: categoria.categoriaNome,
        valor,
        prioridade: PRIORIDADE_MACRO.get(catalogo.macro.id) ?? 2,
        macroOrdem: catalogo.macro.ordem,
        categoriaOrdem: catalogo.ordem,
        ordem
    };
}

function candidatosDaCategoria(categoria) {
    const catalogo = CATEGORIAS_POR_ID.get(categoria.categoriaId);
    if (!catalogo || catalogo.sensivel || categoria.categoriaId === 'anotacao_livre') return [];
    if (categoria.opcoes.length) {
        return categoria.opcoes.map((opcao) =>
            criarCandidato(
                categoria,
                opcao.opcaoNome,
                OPCOES_POR_ID.get(opcao.opcaoId)?.ordem ?? 99
            )
        );
    }
    if (categoria.valorEscalado !== null) {
        const decimal = apresentarDecimal(categoria.valorEscalado, categoria.casasDecimais);
        return [criarCandidato(categoria, `${decimal} ${catalogo.unidade}`)];
    }
    if (categoria.valorDuracaoMinutos !== null) {
        return [criarCandidato(categoria, `${categoria.valorDuracaoMinutos} min`)];
    }
    return [];
}

function apresentarResumoRegistro(registro, categoriasAtivas) {
    const candidatos = registro.categorias
        .filter(({ categoriaId }) => categoriasAtivas.has(categoriaId))
        .flatMap(candidatosDaCategoria)
        .sort(
            (a, b) =>
                a.prioridade - b.prioridade ||
                a.macroOrdem - b.macroOrdem ||
                a.categoriaOrdem - b.categoriaOrdem ||
                a.ordem - b.ordem
        );
    const principais = candidatos
        .slice(0, 3)
        .map(({ prioridade, macroOrdem, categoriaOrdem, ordem, ...item }) => item);
    const anotacao = registro.categorias.find(
        ({ categoriaId }) => categoriaId === 'anotacao_livre'
    );

    return {
        id: registro.id,
        data: formatarData(registro.dataRegistro),
        fase: registro.faseCicloAssociada,
        principais,
        maisQuantidade: Math.max(0, candidatos.length - principais.length),
        trechoAnotacao: anotacao?.valorTexto
            ? [...anotacao.valorTexto].slice(0, 100).join('')
            : null,
        versao: registro.versao,
        atualizadoEm: registro.atualizadoEm.toISOString()
    };
}

export { apresentarResumoRegistro };
