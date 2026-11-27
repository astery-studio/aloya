import { randomUUID } from 'node:crypto';
import { AppError } from '../../shared/errors/AppError.js';
import { publicarSeguranca } from './securityPushEvents.js';
import { validar } from './pushDeviceValidation.js';

export const publico = { id: true, plataforma: true, atualizadoEm: true };

export async function registrarDispositivo(prisma, { id: usuarioId, sessaoId }, entrada) {
    const dados = validar(entrada);

    return prisma.$transaction(async (tx) => {
        const sessao = await tx.sessao.findFirst({
            where: {
                id: sessaoId,
                usuarioId,
                revogadaEm: null,
                validadeSessao: { gt: new Date() }
            },
            select: { id: true }
        });

        if (!sessao) throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');

        const anterior = await tx.dispositivoPush.findUnique({
            where: { instalacao: dados.instalacao }
        });
        const mesmoVinculo =
            anterior?.usuarioId === usuarioId &&
            anterior.sessaoId === sessaoId &&
            anterior.token === dados.token &&
            !anterior.invalidadoEm;
        const vinculo = mesmoVinculo ? anterior.vinculo : randomUUID();

        await tx.dispositivoPush.updateMany({
            where: { token: dados.token, instalacao: { not: dados.instalacao } },
            data: { token: `invalidado:${randomUUID()}`, invalidadoEm: new Date() }
        });

        const registro = { ...dados, usuarioId, sessaoId, vinculo, invalidadoEm: null };
        const dispositivo = await tx.dispositivoPush.upsert({
            where: { instalacao: dados.instalacao },
            create: { id: randomUUID(), ...registro },
            update: registro,
            select: publico
        });

        if (
            anterior?.usuarioId !== usuarioId &&
            (await tx.dispositivoPush.count({
                where: { usuarioId, invalidadoEm: null, id: { not: dispositivo.id } }
            }))
        ) {
            await publicarSeguranca(tx, usuarioId, 'dispositivo.novo', dispositivo.id, new Date());
        }

        return dispositivo;
    });
}
