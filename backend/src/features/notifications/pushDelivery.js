import { criarPayloadPush } from './pushProvider.js';
import { renderizarPush } from './pushTemplates.js';
import { registrarResultado } from './pushDeliveryResult.js';
import { aindaPodeEnviar, obterDispositivoAtivo } from './pushDeliveryEligibility.js';

const minuto = 60000;
const somar = (data, ms) => new Date(+data + ms);

export async function enviarPush({ prisma, provider, relogio, elegivel }, aviso, entrega) {
    const agora = relogio();
    const dispositivo = await obterDispositivoAtivo(prisma, aviso, entrega, agora);

    if (
        !dispositivo ||
        !(await prisma.notificacao.count({
            where: { id: aviso.id, statusEnvio: 'agendada' }
        }))
    ) {
        await prisma.entregaPush.update({
            where: { id: entrega.id },
            data: { status: 'cancelada' }
        });
        return;
    }

    const conteudo = await renderizarPush(prisma, aviso, agora);
    const reivindicada = await prisma.entregaPush.updateMany({
        where: { id: entrega.id, status: 'pendente', proximaTentativa: { lte: agora } },
        data: {
            status: 'processando',
            tentativas: { increment: 1 },
            proximaTentativa: somar(agora, minuto)
        }
    });

    if (!reivindicada.count) return;

    const instanteEnvio = relogio();
    if (
        !(await elegivel(prisma, aviso, instanteEnvio)) ||
        !(await aindaPodeEnviar(prisma, dispositivo, aviso, entrega, instanteEnvio))
    ) {
        await prisma.entregaPush.update({
            where: { id: entrega.id },
            data: { status: 'cancelada' }
        });
        return;
    }

    let resposta;
    try {
        resposta = await provider.enviar(
            criarPayloadPush(aviso, dispositivo.token, instanteEnvio, conteudo)
        );
    } catch {
        // Sem confirmação do provedor, reenviar poderia duplicar o push.
    }

    await registrarResultado(
        prisma,
        { ...entrega, tentativas: entrega.tentativas + 1 },
        resposta,
        agora
    );
}
