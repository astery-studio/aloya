import { enviarPush } from './pushDelivery.js';
import { prepararEntregasPendentes } from './pushPendingDeliveries.js';

const minuto = 60000;
const somar = (data, ms) => new Date(+data + ms);
const prazo = (aviso) => aviso.expiraEm ?? somar(aviso.dataHoraProgramada, 1440 * minuto);

export async function processarAviso(contexto, aviso, agora) {
    const { prisma, elegivel } = contexto;
    const onde = { id: aviso.id, statusEnvio: 'agendada' };
    const lease = somar(agora, minuto);

    const bloqueio = await prisma.notificacao.updateMany({
        where: { ...onde, OR: [{ processandoAte: null }, { processandoAte: { lte: agora } }] },
        data: { processandoAte: lease }
    });

    if (!bloqueio.count) return;

    const finalizar = (dados) =>
        prisma.notificacao.updateMany({
            where: { ...onde, processandoAte: lease },
            data: { processandoAte: null, ...dados }
        });

    if (prazo(aviso) <= agora) return finalizar({ statusEnvio: 'expirada' });
    if (!(await elegivel(prisma, aviso, agora))) return finalizar({ statusEnvio: 'cancelada' });

    const pendentes = await prepararEntregasPendentes(prisma, aviso, agora);
    await Promise.all(pendentes.map((entrega) => enviarPush(contexto, aviso, entrega)));

    const entregas = await prisma.entregaPush.findMany({ where: { notificacaoId: aviso.id } });
    if (entregas.some((e) => ['pendente', 'processando'].includes(e.status)))
        return finalizar({ processandoAte: lease });
    if (!entregas.length) return finalizar({ processandoAte: lease });

    const aceita = entregas.some((e) => ['aceita', 'encaminhada'].includes(e.status));
    return finalizar({
        statusEnvio: aceita ? 'enviada' : 'falha',
        dataHoraDisparo: aceita ? agora : null
    });
}
