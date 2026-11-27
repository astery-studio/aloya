import { permiteHistorico } from '../cycles/utils/cycleRegistration.js';
import { permiteNotificacao } from './notificationEvents.service.js';
import { agendarDiarioCompartilhado } from './sharedDiaryPushPlanning.js';

import { diaMs } from './notificationPlanningContext.js';

export async function agendarResumosCompartilhados({
    prisma,
    vinculo,
    permissoes,
    preferencia,
    usuarioId,
    inicio,
    segunda,
    horaResumo,
    inserir
}) {
    const { titularId } = vinculo;
    const resumo = (evento) =>
        inserir({
            usuarioId,
            evento,
            tipoOrigem: 'rede_apoio',
            origemId: titularId,
            ocorrencia: `${titularId}:${segunda.toISOString().slice(0, 10)}`,
            dataHoraProgramada: horaResumo,
            expiraEm: new Date(+horaResumo + diaMs)
        });

    if (
        permiteHistorico(vinculo) &&
        permiteNotificacao(preferencia, 'redeApoio.ciclo.resumo') &&
        (await prisma.registroCiclo.count({
            where: { usuarioId: titularId, dataInicio: { gte: inicio, lt: segunda } }
        }))
    ) {
        resumo('redeApoio.ciclo.resumo');
    }

    await agendarDiarioCompartilhado({
        prisma,
        permissoes,
        preferencia,
        titularId,
        inicio,
        segunda,
        resumo
    });
}
