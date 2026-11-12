import { formatarData } from '../../cycles/utils/calendar.js';
import { CATEGORIAS_POR_ID, OPCOES_POR_ID } from '../catalog/diaryCatalog.lookup.js';

const PRIORIDADE_MACRO = new Map([
    ['corpo_sintomas_fisicos', 0],
    ['emocional', 1]
]);

function criarTrechoAnotacao(valor, limite = 100) {
    if (typeof valor !== 'string' || !valor || !Number.isSafeInteger(limite) || limite < 2)
        return null;
    const caracteres = [...valor];
    if (caracteres.length <= limite) return valor;
    return `${caracteres.slice(0, limite - 1).join('')}…`;
}

function criarCandidato(categoria, valor) {
    const catalogo = CATEGORIAS_POR_ID.get(categoria.categoriaId);
    return {
        categoriaId: categoria.categoriaId,
        categoria: categoria.categoriaNome,
        valor,
        macrocategoriaId: catalogo.macro.id,
        prioridade: PRIORIDADE_MACRO.get(catalogo.macro.id) ?? 2,
        macroOrdem: catalogo.macro.ordem,
        categoriaOrdem: catalogo.ordem
    };
}

function obterNomeMicrocategoria(categoria) {
    if (categoria.categoriaId !== 'banheiro' || !categoria.opcoes.length) {
        return categoria.categoriaNome;
    }
    const grupos = new Set(
        categoria.opcoes.map((opcao) => OPCOES_POR_ID.get(opcao.opcaoId)?.grupo).filter(Boolean)
    );
    if (grupos.size !== 1) return categoria.categoriaNome;
    const grupo = [...grupos][0];
    if (grupo === 'intestino') return 'Intestino';
    return 'Urina';
}

function candidatosDaCategoria(categoria) {
    const catalogo = CATEGORIAS_POR_ID.get(categoria.categoriaId);
    if (!catalogo || catalogo.sensivel || categoria.categoriaId === 'anotacao_livre') return [];
    if (
        categoria.opcoes.length ||
        categoria.valorEscalado !== null ||
        categoria.valorDuracaoMinutos !== null
    ) {
        return [criarCandidato(categoria, obterNomeMicrocategoria(categoria))];
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
                a.categoriaOrdem - b.categoriaOrdem
        );
    const principais = candidatos
        .slice(0, 3)
        .map(({ prioridade, macroOrdem, categoriaOrdem, ...item }) => item);
    const anotacao = registro.categorias.find(
        ({ categoriaId }) => categoriaId === 'anotacao_livre'
    );

    return {
        id: registro.id,
        data: formatarData(registro.dataRegistro),
        fase: registro.faseCicloAssociada,
        principais,
        maisQuantidade: Math.max(0, candidatos.length - principais.length),
        trechoAnotacao: criarTrechoAnotacao(anotacao?.valorTexto),
        versao: registro.versao,
        atualizadoEm: registro.atualizadoEm.toISOString()
    };
}

export { apresentarResumoRegistro, criarTrechoAnotacao, obterNomeMicrocategoria };
