export async function obterDispositivoAtivo(prisma, aviso, entrega, agora) {
    const dispositivo = await prisma.dispositivoPush.findFirst({
        where: {
            id: entrega.dispositivoId,
            usuarioId: aviso.usuarioId,
            vinculo: entrega.vinculo,
            invalidadoEm: null
        }
    });
    const sessao =
        dispositivo &&
        (await prisma.sessao.findFirst({
            where: {
                id: dispositivo.sessaoId,
                usuarioId: aviso.usuarioId,
                revogadaEm: null,
                validadeSessao: { gt: agora }
            },
            select: { id: true }
        }));
    return sessao ? dispositivo : null;
}

export async function aindaPodeEnviar(prisma, dispositivo, aviso, entrega, agora) {
    const aindaVinculado = await prisma.dispositivoPush.count({
        where: {
            id: dispositivo.id,
            usuarioId: aviso.usuarioId,
            vinculo: entrega.vinculo,
            invalidadoEm: null
        }
    });
    return Boolean(
        aindaVinculado &&
        (await prisma.sessao.count({
            where: {
                id: dispositivo.sessaoId,
                usuarioId: aviso.usuarioId,
                revogadaEm: null,
                validadeSessao: { gt: agora }
            }
        })) &&
        (await prisma.notificacao.count({ where: { id: aviso.id, statusEnvio: 'agendada' } }))
    );
}
