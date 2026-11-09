import { formatarData } from '../../cycles/utils/calendar.js';
import { CONFIGURACAO_TERMICA_SOMBRA } from './thermal.config.js';
import { detectarPadraoTermico } from './thermal.engine.js';
import { persistirAnaliseTermica } from './thermal.persistence.js';
import { localizarCiclosAfetados } from './thermalCycle.lookup.js';
function criarThermalRecalculationService({
    config = CONFIGURACAO_TERMICA_SOMBRA,
    detectar = detectarPadraoTermico
} = {}) {
    async function recalcularPorDatas(usuarioId, datas, tx) {
        const unicas = [...new Set(datas.filter(Boolean))];
        if (unicas.length === 0) return;
        const ciclos = await tx.registroCiclo.findMany({
            where: { usuarioId },
            orderBy: [{ dataInicio: 'asc' }, { id: 'asc' }],
            select: { id: true, dataInicio: true }
        });
        const afetados = localizarCiclosAfetados(ciclos, unicas);
        for (let indice = 0; indice < ciclos.length; indice += 1) {
            const ciclo = ciclos[indice];
            if (!afetados.has(ciclo.id)) continue;
            const proximo = ciclos[indice + 1];
            const registros = await tx.registroDiario.findMany({
                where: {
                    usuarioId,
                    dataRegistro: {
                        gte: ciclo.dataInicio,
                        ...(proximo ? { lt: proximo.dataInicio } : {})
                    },
                    categorias: { some: { categoriaId: 'temperatura_basal' } }
                },
                orderBy: [{ dataRegistro: 'asc' }, { id: 'asc' }],
                select: {
                    dataRegistro: true,
                    categorias: {
                        where: { categoriaId: 'temperatura_basal' },
                        select: {
                            valorEscalado: true,
                            medicaoTemperatura: {
                                select: { perturbada: true }
                            }
                        }
                    }
                }
            });
            const medicoes = registros.map((registro) => ({
                data: formatarData(registro.dataRegistro),
                valorDecimos: registro.categorias[0].valorEscalado,
                perturbada: registro.categorias[0].medicaoTemperatura?.perturbada ?? false
            }));
            const resultado = detectar(medicoes, config);
            const avaliadoAte = registros.at(-1)?.dataRegistro ?? null;
            await persistirAnaliseTermica(
                tx,
                ciclo,
                usuarioId,
                config,
                resultado,
                !proximo,
                avaliadoAte
            );
        }
    }
    async function recalcularTodos(usuarioId, tx) {
        const ciclos = await tx.registroCiclo.findMany({
            where: { usuarioId },
            orderBy: [{ dataInicio: 'asc' }, { id: 'asc' }],
            select: { dataInicio: true }
        });
        await recalcularPorDatas(
            usuarioId,
            ciclos.map((ciclo) => formatarData(ciclo.dataInicio)),
            tx
        );
    }
    return { recalcularPorDatas, recalcularTodos };
}
export { criarThermalRecalculationService };
export { localizarCiclosAfetados } from './thermalCycle.lookup.js';
