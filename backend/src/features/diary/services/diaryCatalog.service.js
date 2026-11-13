import { AppError } from '../../../shared/errors/AppError.js';
import { CATALOGO_DIARIO } from '../catalog/diary.catalog.js';

function criarDiaryCatalogService({ prisma } = {}) {
    if (!prisma?.configuracaoDiario || !prisma?.preferenciaCategoriaDiario) {
        throw new TypeError('Não foi possível configurar o catálogo do Diário.');
    }

    async function buscar(usuarioId) {
        if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
            throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');
        }

        const [configuracao, macros, categorias] = await Promise.all([
            prisma.configuracaoDiario.findUnique({ where: { usuarioId } }),
            prisma.preferenciaMacrocategoriaDiario.findMany({ where: { usuarioId } }),
            prisma.preferenciaCategoriaDiario.findMany({ where: { usuarioId } })
        ]);
        const estadoMacros = new Map(macros.map((item) => [item.macrocategoriaId, item.ativa]));
        const estadoCategorias = new Map(categorias.map((item) => [item.categoriaId, item.ativa]));

        return {
            versao: configuracao?.versao ?? 0,
            macrocategorias: CATALOGO_DIARIO.map((macro) => {
                const ativa = estadoMacros.get(macro.id) ?? true;

                return {
                    id: macro.id,
                    nome: macro.nome,
                    nomeCompacto: macro.nomeCompacto ?? null,
                    ordem: macro.ordem,
                    sensivel: macro.sensivel,
                    ativa,
                    recolhidaPorPadrao: macro.id === 'vida_intima_social',
                    categorias: macro.categorias.map((categoria) => {
                        const ativaIndividual = estadoCategorias.get(categoria.id) ?? true;
                        return {
                            id: categoria.id,
                            nome: categoria.nome,
                            ordem: categoria.ordem,
                            tipoValor: categoria.tipoValor,
                            sensivel: categoria.sensivel,
                            unidade: categoria.unidade ?? null,
                            casasDecimais: categoria.casasDecimais ?? null,
                            valorMinimo: categoria.valorMinimo ?? null,
                            valorMaximo: categoria.valorMaximo ?? null,
                            aceitaPerturbacao: categoria.aceitaPerturbacao ?? false,
                            limiteCaracteres: categoria.limiteCaracteres ?? null,
                            ativaIndividual,
                            ativaEfetiva: ativa && ativaIndividual,
                            opcoes: categoria.opcoes
                        };
                    })
                };
            })
        };
    }

    return { buscar };
}

export { criarDiaryCatalogService };
