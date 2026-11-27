import { horariosDaAgenda } from '../utils/contraceptive.listing.schedule.js';
import { sincronizarNotificacoesEdicao } from '../utils/contraceptive.notifications.js';

async function normalizarHorariosPilula(prisma, agora = new Date()) {
    const pilulas = await prisma.anticoncepcional.findMany({
        where: { tipo: 'pilula' },
        select: { id: true, horariosProgramados: true }
    });

    let atualizadas = 0;
    for (const pilula of pilulas) {
        const { id, horariosProgramados } = pilula;
        if (!Array.isArray(horariosProgramados) || horariosProgramados.length <= 1) {
            continue;
        }

        const atualizada = await prisma.$transaction(async (transacao) => {
            const registroAtual = await transacao.anticoncepcional.findUnique({
                where: { id }
            });
            if (
                registroAtual?.tipo !== 'pilula' ||
                registroAtual.horariosProgramados?.length <= 1
            ) {
                return false;
            }

            const [horario] = horariosDaAgenda(registroAtual);
            if (!horario) {
                return false;
            }

            const dadosAgenda = { horariosProgramados: [horario] };
            const resultado = await transacao.anticoncepcional.updateMany({
                where: { id, atualizadoEm: registroAtual.atualizadoEm },
                data: dadosAgenda
            });
            if (resultado.count !== 1) {
                return false;
            }

            if (registroAtual.ativo) {
                await sincronizarNotificacoesEdicao({
                    transacao,
                    usuarioId: registroAtual.usuarioId,
                    anticoncepcionalId: id,
                    registroAtual,
                    dadosNovos: { ...registroAtual, ...dadosAgenda },
                    agora
                });
            }

            return true;
        });

        if (atualizada) {
            atualizadas += 1;
        }
    }

    return atualizadas;
}

export { normalizarHorariosPilula };
