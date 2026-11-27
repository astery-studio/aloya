export async function reconciliarAgendamentos(prisma, usuarioId, candidatos) {
    for (const aviso of candidatos) {
        const { evento, ocorrencia, dataHoraProgramada, expiraEm, origemId } = aviso;
        await prisma.$transaction(async (tx) => {
            const where = { usuarioId, evento, ocorrencia };
            const anterior = await tx.notificacao.findFirst({
                where,
                include: { _count: { select: { entregas: true } } }
            });
            if (!anterior) await tx.notificacao.create({ data: aviso });
            else if (
                !anterior._count.entregas &&
                ['agendada', 'cancelada'].includes(anterior.statusEnvio) &&
                (anterior.statusEnvio === 'cancelada' ||
                    +anterior.dataHoraProgramada !== +dataHoraProgramada)
            ) {
                await tx.notificacao.updateMany({
                    where: { id: anterior.id, processandoAte: null, entregas: { none: {} } },
                    data: { dataHoraProgramada, expiraEm, origemId, statusEnvio: 'agendada' }
                });
            }
        });
    }
}
