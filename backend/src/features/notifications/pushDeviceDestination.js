import { AppError } from '../../shared/errors/AppError.js';
import { destinoDoEvento } from './pushProvider.js';
import { podeProcessar } from './pushEligibility.js';

export async function resolverDestinoPush(prisma, req, res) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw new AppError('Notificação inválida.', 422);
    const notificacao = await prisma.notificacao.findFirst({
        where: {
            id,
            usuarioId: req.usuario.id,
            entregas: {
                some: {
                    status: { in: ['aceita', 'encaminhada', 'sem_recibo'] },
                    dispositivo: {
                        usuarioId: req.usuario.id,
                        sessaoId: req.usuario.sessaoId,
                        invalidadoEm: null
                    }
                }
            }
        },
        include: { entregas: { select: { vinculo: true, dispositivo: true, status: true } } }
    });
    if (
        !notificacao ||
        !notificacao.entregas.some(
            (entrega) =>
                ['aceita', 'encaminhada', 'sem_recibo'].includes(entrega.status) &&
                entrega.dispositivo.sessaoId === req.usuario.sessaoId &&
                entrega.dispositivo.usuarioId === req.usuario.id &&
                entrega.dispositivo.vinculo === entrega.vinculo &&
                !entrega.dispositivo.invalidadoEm
        ) ||
        !(await podeProcessar(prisma, notificacao, new Date(), { aoAbrir: true }))
    ) {
        throw new AppError('Notificação indisponível.', 404);
    }
    return res.json({ destino: destinoDoEvento(notificacao.evento) });
}
