import { AppError } from '../../../shared/errors/AppError.js';
import { formatarData } from '../utils/calendar.js';

function criarConflito(ciclo) {
    const erro = new AppError(
        'O período informado se sobrepõe a outro ciclo já registrado.',
        409,
        'SOBREPOSICAO_CICLO'
    );
    erro.conflito = {
        dataInicio: formatarData(ciclo.dataInicio),
        dataFim: ciclo.dataFim ? formatarData(ciclo.dataFim) : null
    };
    return erro;
}

async function prepararDiasOutrosCiclos(
    tx,
    { usuarioId, cicloId, dias, confirmarOutrosCiclos, ignorarCiclos = [] }
) {
    if (!dias.length) return { dias, alteracoes: [] };
    const ciclos = await tx.registroCiclo.findMany({
        where: {
            usuarioId,
            id: { notIn: [cicloId, ...ignorarCiclos] },
            dataInicio: { lte: dias.at(-1) },
            OR: [{ dataFim: { gte: dias[0] } }, { dataFim: null }]
        },
        include: { diasMenstruacao: { orderBy: { data: 'asc' } } },
        orderBy: { dataInicio: 'asc' }
    });
    const restantes = [];
    const porCiclo = new Map();
    for (const dia of dias) {
        const candidatos = ciclos.filter((ciclo) => {
            const fim = ciclo.dataFim ?? ciclo.diasMenstruacao.at(-1)?.data;
            return fim && dia >= ciclo.dataInicio && dia <= fim;
        });
        if (!candidatos.length) {
            restantes.push(dia);
            continue;
        }
        const ciclo = candidatos[0];
        if (
            candidatos.length > 1 ||
            ciclo.diasMenstruacao.some(
                (registro) => formatarData(registro.data) === formatarData(dia)
            )
        )
            throw criarConflito(ciclo);
        if (!porCiclo.has(ciclo.id)) porCiclo.set(ciclo.id, { ciclo, dias: [] });
        porCiclo.get(ciclo.id).dias.push(dia);
    }
    const alteracoes = [...porCiclo.values()];
    if (alteracoes.length && !confirmarOutrosCiclos) {
        const erro = new AppError(
            'A seleção inclui dias desmarcados de outros ciclos. Confirme a restauração desses dias.',
            409,
            'CONFIRMAR_ALTERACAO_OUTROS_CICLOS'
        );
        erro.outrosCiclos = alteracoes.map(({ ciclo, dias: novos }) => ({
            cicloId: ciclo.id,
            dataInicio: formatarData(ciclo.dataInicio),
            dataFim: ciclo.dataFim ? formatarData(ciclo.dataFim) : null,
            dias: novos.map(formatarData)
        }));
        throw erro;
    }
    return { dias: restantes, alteracoes };
}

async function restaurarDiasOutrosCiclos(tx, usuarioId, alteracoes) {
    for (const { ciclo, dias } of alteracoes) {
        const atualizado = await tx.registroCiclo.updateMany({
            where: { id: ciclo.id, usuarioId, atualizadoEm: ciclo.atualizadoEm },
            data: {
                duracaoMenstruacao: ciclo.dataFim
                    ? ciclo.diasMenstruacao.length + dias.length
                    : null
            }
        });
        if (atualizado.count !== 1)
            throw new AppError(
                'Atualize os dados e tente novamente.',
                409,
                'CONFLITO_EDICAO_CICLO'
            );
        await tx.diaMenstruacao.createMany({
            data: dias.map((data) => ({
                registroCicloId: ciclo.id,
                data,
                statusSincronizacao: 'sincronizado'
            }))
        });
    }
}
export { prepararDiasOutrosCiclos, restaurarDiasOutrosCiclos };
