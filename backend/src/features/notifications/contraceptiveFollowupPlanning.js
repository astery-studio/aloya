import { dataHoraNoFuso } from '../contraceptives/validators/contraceptiveUsage.validator.js';
import { diaMs, somarDias } from './notificationPlanningContext.js';

export function planejarReenvios({
    data,
    hora,
    fuso,
    metodo,
    politicasClinicas,
    autoriza,
    agora,
    horizonte,
    resultado,
    usuarioId
}) {
    const base = dataHoraNoFuso(data, hora, fuso);
    const politica = politicasClinicas.get(metodo.id) ?? [];
    if (base)
        for (const [indice, { fase, atraso }] of politica.entries()) {
            const evento = `anticoncepcional.naoConfirmado.${fase}`;
            const dataHoraProgramada = new Date(+base + atraso * 60000);
            const proximo = politica[indice + 1];
            const expiraEm = proximo
                ? new Date(+base + proximo.atraso * 60000)
                : new Date(+dataHoraProgramada + diaMs);
            if (
                autoriza(evento) &&
                expiraEm > agora &&
                dataHoraProgramada < new Date(somarDias(horizonte, 1))
            )
                resultado.push({
                    usuarioId,
                    evento,
                    ocorrencia: `${metodo.id}:${data}:${hora}:${atraso}`,
                    origemId: metodo.id,
                    tipoOrigem: 'anticoncepcional',
                    dataHoraProgramada,
                    expiraEm
                });
        }
}
