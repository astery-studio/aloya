import { obterFrequencia } from '../contraceptives/constants/contraceptive.constants.js';
import {
    dataCivil,
    horarioPertenceAgenda
} from '../contraceptives/utils/contraceptive.listing.schedule.js';
import { diaMs, somarDias } from './notificationPlanningContext.js';
import { planejarReenvios } from './contraceptiveFollowupPlanning.js';
import { planejarPausas } from './contraceptivePausePlanning.js';

export function planejarAnticoncepcional(metodo, contexto) {
    const { porDia, preferencia, hoje, recuo } = contexto;
    const validade = dataCivil(metodo.dataValidade);
    const inicio = dataCivil(metodo.dataInicioUso);
    const regra = obterFrequencia(metodo.tipo, metodo.frequencia);
    const antecedencia = preferencia?.antecedenciaAvisoTroca ?? 7;
    const agendar = (evento, dia, hora, ocorrencia = dia) =>
        porDia(`anticoncepcional.${evento}`, dia, {
            origemId: metodo.id,
            horarioLocal: hora,
            ocorrencia: `${metodo.id}:${ocorrencia}`
        });
    if (validade) {
        agendar('validade.proxima', somarDias(validade, -antecedencia));
        agendar('validade.atingida', validade);
        if (metodo.tipo === 'diu_hormonal') {
            agendar('diu.proxima', somarDias(validade, -antecedencia));
            agendar('diu.data', validade);
        }
    }
    if (!inicio || !regra) return;
    const horarios = Array.isArray(metodo.horariosProgramados) ? metodo.horariosProgramados : [];
    for (let n = -recuo; n <= 7 + antecedencia; n++) {
        const data = somarDias(hoje, n);
        if (data < inicio || (validade && data > validade)) continue;
        const decorrido = Math.round((Date.parse(data) - Date.parse(inicio)) / diaMs);
        const tamanho = regra.diasUso + (regra.diasPausa ?? 0);
        const posicao = tamanho ? decorrido % tamanho : -1;
        planejarPausas(metodo, regra, posicao, tamanho, decorrido, data, horarios, agendar);
        for (const hora of horarios) {
            if (
                !horarioPertenceAgenda(metodo, data, hora) ||
                metodo.usos.some(
                    (uso) =>
                        dataCivil(uso.dataUsoProgramado) === data && uso.horarioProgramado === hora
                )
            )
                continue;
            agendar('rotina.horario', data, hora, `${data}:${hora}`);
            planejarReenvios({ ...contexto, data, hora, metodo });
            if (metodo.tipo === 'injetavel') {
                agendar('injetavel.hoje', data, hora);
                agendar('injetavel.proxima', somarDias(data, -antecedencia), hora, data);
            }
            if (metodo.tipo === 'adesivo' && decorrido > 0 && posicao !== 0)
                agendar('adesivo.troca', data, hora);
        }
    }
}
