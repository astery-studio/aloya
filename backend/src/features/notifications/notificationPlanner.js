import { criarPredictionService } from '../cycles/services/prediction.service.js';
import { permiteNotificacao } from './notificationEvents.service.js';
import { lerPoliticaDeAlertas } from './contraceptivePushPolicy.js';
import { criarContextoPlanejamento, somarDias } from './notificationPlanningContext.js';
import { planejarCiclo } from './cyclePushPlanning.js';
import { planejarAnticoncepcional } from './contraceptiveSchedulePlanning.js';

export { reconciliarAgendamentos } from './notificationScheduleReconciliation.js';

export async function planejarConta(
    prisma,
    usuarioId,
    preferencia,
    agora,
    { autoriza = (evento) => permiteNotificacao(preferencia, evento), fusoAlternativo } = {}
) {
    const contexto = await criarContextoPlanejamento(
        prisma,
        usuarioId,
        preferencia,
        agora,
        autoriza,
        fusoAlternativo
    );

    if (!contexto) return [];

    const { hoje, amanha, porDia, resultado } = contexto;
    const politicasClinicas = lerPoliticaDeAlertas();
    const recuo = Math.max(
        0,
        ...[...politicasClinicas.values()].map((politica) =>
            Math.ceil(politica.at(-1).atraso / 1440)
        )
    );

    const [previsao, registrosDiario, metodos] = await Promise.all([
        criarPredictionService({ prisma, agora: () => new Date(`${hoje}T12:00:00Z`) }).buscar(
            usuarioId
        ),
        prisma.registroDiario.findMany({
            where: { usuarioId, dataRegistro: { gte: new Date(somarDias(hoje, -13)) } },
            select: { dataRegistro: true }
        }),
        prisma.anticoncepcional.findMany({
            where: { usuarioId, ativo: true },
            include: {
                usos: {
                    where: {
                        dataUsoProgramado: { gte: new Date(somarDias(hoje, -recuo)) },
                        statusUso: 'confirmado'
                    }
                }
            }
        })
    ]);

    planejarCiclo({ previsao, registrosDiario, hoje, amanha, preferencia, porDia });
    for (const metodo of metodos) {
        planejarAnticoncepcional(metodo, {
            ...contexto,
            agora,
            autoriza,
            usuarioId,
            preferencia,
            recuo,
            politicasClinicas
        });
    }

    return resultado;
}
