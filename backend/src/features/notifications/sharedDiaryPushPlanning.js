import { permiteNotificacao } from './notificationEvents.service.js';
import { grupoNotificacaoDiario } from './sharedNotificationPermissions.js';

export async function agendarDiarioCompartilhado({
    prisma,
    permissoes,
    preferencia,
    titularId,
    inicio,
    segunda,
    resumo
}) {
    const diarioPermitido = permissoes
        .map((permissao) => ({
            grupo: grupoNotificacaoDiario(permissao),
            categoria: permissao.split('.')[1]
        }))
        .filter(({ grupo }) => grupo && permiteNotificacao(preferencia, `redeApoio.diario.${grupo}`));
    if (!diarioPermitido.length) return;
    const preenchidas = await prisma.registroDiarioCategoria.findMany({
        where: {
            registro: { usuarioId: titularId, dataRegistro: { gte: inicio, lt: segunda } }
        },
        distinct: ['categoriaId'],
        select: { categoriaId: true }
    });
    for (const { grupo, categoria } of diarioPermitido) {
        if (preenchidas.some(({ categoriaId }) => categoriaId === categoria))
            resumo(`redeApoio.diario.${grupo}`);
    }
}
