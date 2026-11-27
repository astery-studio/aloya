import { podeProcessar } from './pushEligibility.js';
import { registrarResultado } from './pushDeliveryResult.js';
import { processarAviso } from './pushOccurrence.js';

const minuto = 60000;
const somar = (data, ms) => new Date(+data + ms);

export function criarPushWorker({
    prisma,
    provider,
    relogio = () => new Date(),
    elegivel = podeProcessar
}) {
    const contexto = { prisma, provider, relogio, elegivel };

    async function processar() {
        const agora = relogio();
        const avisos = await prisma.notificacao.findMany({
            where: {
                evento: { not: null },
                statusEnvio: 'agendada',
                dataHoraProgramada: { lte: agora },
                OR: [{ processandoAte: null }, { processandoAte: { lte: agora } }]
            },
            include: { entregas: true },
            orderBy: [{ dataHoraProgramada: 'asc' }, { id: 'asc' }],
            take: 50
        });
        for (const aviso of avisos) await processarAviso(contexto, aviso, relogio());
        await prisma.entregaPush.updateMany({
            where: { status: 'aceita', aceitaEm: { lt: somar(agora, -23 * 60 * minuto) } },
            data: { status: 'sem_recibo', erro: 'ReciboIndisponivel' }
        });
        const aceitas = await prisma.entregaPush.findMany({
            where: { status: 'aceita', proximaTentativa: { lte: agora } },
            take: 100
        });
        if (!aceitas.length) return;
        let recibos;
        try {
            recibos = await provider.recibos(aceitas.map((item) => item.ticket));
        } catch {
            return;
        }
        for (const item of aceitas)
            await registrarResultado(prisma, item, recibos?.[item.ticket], agora, true);
    }
    return { processar };
}
