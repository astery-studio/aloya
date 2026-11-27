import { dataCivil } from '../contraceptives/utils/contraceptive.listing.schedule.js';
import { somarDias } from './notificationPlanningContext.js';

export function planejarCiclo({ previsao, registrosDiario, hoje, amanha, preferencia, porDia }) {
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
        const inicio = datas.inicio ?? datas.data;
        if (!inicio) continue;
        porDia(`ciclo.fases.${fase}`, inicio);

        const fim = datas.fim ?? inicio;
        const intervalos = inicio === fim ? [0] : [1, 3, 5];
        for (const intervalo of intervalos) {
            const dia = somarDias(inicio, intervalo);
            if (dia <= fim) porDia(`ciclo.dicas.${fase}`, dia);
        }
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
