export async function prepararEntregasPendentes(prisma, aviso, agora) {
    const dispositivos = await prisma.dispositivoPush.findMany({
        where: {
            usuarioId: aviso.usuarioId,
            invalidadoEm: null,
            ...(aviso.evento === 'seguranca.dispositivo.novo'
                ? { id: { not: aviso.ocorrencia } }
                : {})
        },
        select: { id: true, vinculo: true }
    });

    await prisma.entregaPush.createMany({
        data: dispositivos
            .filter(
                (item) =>
                    !aviso.entregas.some(
                        (entrega) =>
                            entrega.dispositivoId === item.id && entrega.vinculo === item.vinculo
                    )
            )
            .map((item) => ({
                notificacaoId: aviso.id,
                dispositivoId: item.id,
                vinculo: item.vinculo,
                proximaTentativa: agora
            }))
    });

    await prisma.entregaPush.updateMany({
        where: {
            notificacaoId: aviso.id,
            status: 'processando',
            proximaTentativa: { lte: agora }
        },
        data: { status: 'falha', erro: 'RespostaIndeterminada' }
    });

    return prisma.entregaPush.findMany({
        where: {
            notificacaoId: aviso.id,
            status: 'pendente',
            proximaTentativa: { lte: agora }
        },
        take: 25
    });
}
