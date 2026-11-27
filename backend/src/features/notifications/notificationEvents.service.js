import { valoresIniciais } from './notificationPreferenceFields.js';

const camposCategoria = {
    ciclo: 'cicloPrevisoesAtivo',
    anticoncepcional: 'anticoncepcionalAtivo',
    redeApoio: 'redeApoioAtiva'
};

export function permiteNotificacao(preferencia, evento) {
    const grupo = evento.slice(0, evento.lastIndexOf('.'));
    const categoria = evento.split('.')[0];
    const ajustes = preferencia?.ajustesPorEvento;

    return (
        preferencia?.[camposCategoria[categoria]] !== false &&
        (ajustes?.[grupo] ?? valoresIniciais[grupo]) === true &&
        (evento === 'ciclo.diario.lembrete'
            ? (preferencia?.lembreteDiarioAtivo ?? valoresIniciais.lembreteDiarioAtivo)
            : (ajustes?.[evento] ?? valoresIniciais[evento])) === true
    );
}

export async function agendarEvento(transacao, { usuarioId, evento, ocorrencia, ...dados }) {
    const resultado = await transacao.notificacao.upsert({
        where: { usuarioId_evento_ocorrencia: { usuarioId, evento, ocorrencia } },
        create: { usuarioId, evento, ocorrencia, ...dados },
        update: {},
        select: { id: true }
    });

    return resultado.id;
}
