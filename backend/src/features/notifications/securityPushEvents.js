import { agendarEvento } from './notificationEvents.service.js';

export function publicarSeguranca(tx, usuarioId, evento, ocorrencia, instante) {
    return agendarEvento(tx, {
        usuarioId,
        evento: `seguranca.${evento}`,
        ocorrencia: String(ocorrencia),
        tipoOrigem: 'seguranca',
        dataHoraProgramada: instante,
        expiraEm: new Date(+instante + 86400000)
    });
}
