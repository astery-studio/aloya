// Calcula padrões recentes e não sensíveis para o resumo personalizado do Diário.
import { AppError } from '../../../shared/errors/AppError.js';
import { CATEGORIAS_POR_ID, OPCOES_POR_ID } from '../catalog/diaryCatalog.lookup.js';
import { obterCategoriasAtivas } from './diaryActiveCategories.js';

const LIMITE_REGISTROS_ANALISADOS = 12;
const MINIMO_REGISTROS = 3;
const MINIMO_OCORRENCIAS = 2;

function criarMarcador(categoria, opcao = null) {
    const catalogo = CATEGORIAS_POR_ID.get(categoria.categoriaId);
    if (!catalogo || catalogo.sensivel || categoria.categoriaId === 'anotacao_livre') return null;
    const opcaoCatalogo = opcao ? OPCOES_POR_ID.get(opcao.opcaoId) : null;
    return {
        chave: opcao ? `opcao:${opcao.opcaoId}` : `categoria:${categoria.categoriaId}`,
        categoriaId: categoria.categoriaId,
        grupo: opcaoCatalogo?.grupo ?? null,
        valor: opcao?.opcaoNome ?? categoria.categoriaNome,
        macroOrdem: catalogo.macro.ordem,
        categoriaOrdem: catalogo.ordem,
        opcaoOrdem: opcaoCatalogo?.ordem ?? 0
    };
}

function contarMarcadores(registros, categoriasAtivas) {
    const contagem = new Map();
    for (const registro of registros) {
        const marcadoresDoDia = new Map();
        for (const categoria of registro.categorias) {
            if (!categoriasAtivas.has(categoria.categoriaId)) continue;
            const marcadores = categoria.opcoes.length
                ? categoria.opcoes.map((opcao) => criarMarcador(categoria, opcao))
                : [criarMarcador(categoria)];
            for (const marcador of marcadores) {
                if (marcador) marcadoresDoDia.set(marcador.chave, marcador);
            }
        }
        for (const marcador of marcadoresDoDia.values()) {
            const atual = contagem.get(marcador.chave);
            contagem.set(marcador.chave, {
                ...marcador,
                ocorrencias: (atual?.ocorrencias ?? 0) + 1
            });
        }
    }
    return [...contagem.values()];
}

function compararDestaques(a, b) {
    return (
        b.ocorrencias - a.ocorrencias ||
        a.macroOrdem - b.macroOrdem ||
        a.categoriaOrdem - b.categoriaOrdem ||
        a.opcaoOrdem - b.opcaoOrdem ||
        a.valor.localeCompare(b.valor, 'pt-BR')
    );
}

function criarDiaryOverviewService({ prisma } = {}) {
    if (!prisma?.registroDiario?.findMany || !prisma?.registroDiario?.count) {
        throw new TypeError('Não foi possível configurar o resumo do Diário.');
    }

    async function buscar(usuarioId, fase) {
        if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
            throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');
        }
        const [diasRegistrados, preferenciasMacro, preferenciasCategoria, registros] =
            await Promise.all([
                prisma.registroDiario.count({ where: { usuarioId } }),
                prisma.preferenciaMacrocategoriaDiario.findMany({ where: { usuarioId } }),
                prisma.preferenciaCategoriaDiario.findMany({ where: { usuarioId } }),
                prisma.registroDiario.findMany({
                    where: { usuarioId, faseCicloAssociada: fase },
                    orderBy: [{ dataRegistro: 'desc' }, { id: 'desc' }],
                    take: LIMITE_REGISTROS_ANALISADOS,
                    select: {
                        categorias: {
                            where: {
                                categoriaId: { not: 'anotacao_livre' },
                                categoria: { sensivel: false }
                            },
                            select: {
                                categoriaId: true,
                                categoriaNome: true,
                                opcoes: { select: { opcaoId: true, opcaoNome: true } }
                            }
                        }
                    }
                })
            ]);
        const categoriasAtivas = obterCategoriasAtivas(preferenciasMacro, preferenciasCategoria);
        const destaques = contarMarcadores(registros, categoriasAtivas)
            .filter(({ ocorrencias }) => ocorrencias >= MINIMO_OCORRENCIAS)
            .sort(compararDestaques)
            .slice(0, 3)
            .map(({ chave, macroOrdem, categoriaOrdem, opcaoOrdem, ...destaque }) => destaque);

        return {
            fase,
            diasRegistrados,
            quantidadeRegistrosFase: registros.length,
            informacoesSuficientes: registros.length >= MINIMO_REGISTROS && destaques.length > 0,
            destaques
        };
    }

    return { buscar };
}

export {
    compararDestaques,
    contarMarcadores,
    criarDiaryOverviewService,
    LIMITE_REGISTROS_ANALISADOS,
    MINIMO_OCORRENCIAS,
    MINIMO_REGISTROS
};
