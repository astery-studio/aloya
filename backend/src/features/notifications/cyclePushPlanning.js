import { dataCivil } from '../contraceptives/utils/contraceptive.listing.schedule.js';
import { somarDias } from './notificationPlanningContext.js';

export function planejarCiclo({
    previsao,
    registrosDiario,
    hoje,
    amanha,
    preferencia,
    porDia,
    autoriza
}) {
    const proximo = previsao.proximoInicioEstimado;
    if (proximo && proximo >= hoje) {
        porDia(
            'ciclo.menstrual.proxima',
            somarDias(proximo, -(preferencia?.antecedenciaProximoCiclo ?? 2)),
            { tipoOrigem: 'proximidade_ciclo', ocorrencia: proximo }
        );
        porDia('ciclo.menstrual.confirmacao', proximo, { tipoOrigem: 'confirmacao_ciclo' });
    }
    for (const [chave, datas] of Object.entries(previsao.fasesEstimadas ?? {})) {
        const fase = chave === 'folicularPosMenstrual' ? 'folicular' : chave;
        const data = datas.inicio ?? datas.data;
        const transicao = `ciclo.fases.${fase}`;
        porDia(autoriza(transicao) ? transicao : `ciclo.dicas.${fase}`, data);
    }
    const preenchidos = new Set(
        registrosDiario.map((registro) => dataCivil(registro.dataRegistro))
    );
    for (const data of [hoje, amanha]) {
        if (!preenchidos.has(data))
            porDia('ciclo.diario.lembrete', data, { tipoOrigem: 'lembrete_diario' });
        if (new Date(data).getUTCDay() === 1) {
            const inicio = somarDias(data, -7);
            const anterior = somarDias(data, -14);
            if ([...preenchidos].some((dia) => dia >= inicio && dia < data)) {
                porDia('ciclo.diario.resumoSemanal', data, { tipoOrigem: 'lembrete_diario' });
                if ([...preenchidos].some((dia) => dia >= anterior && dia < inicio)) {
                    porDia('ciclo.diario.comparacaoPeriodos', data, {
                        tipoOrigem: 'lembrete_diario'
                    });
                }
            }
        }
    }
}
