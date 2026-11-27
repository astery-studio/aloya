import { agendarEvento, permiteNotificacao } from './notificationEvents.service.js';

const dia = 86400000;

export async function planejarExpiracoes(
    prisma,
    usuarioId,
    preferencia,
    agora,
    { incluirConsentimento = true } = {}
) {
    const proximidade = 'redeApoio.convites.proximoExpiracao';
    const expirado = 'redeApoio.convites.expirado';
    const consentimentoExpirado = 'redeApoio.consentimento.expirado';

    const anterior = new Date(+agora - dia);

    if (
        permiteNotificacao(preferencia, proximidade) ||
        permiteNotificacao(preferencia, expirado)
    ) {
        const convites = await prisma.vinculoRedeApoio.findMany({
            where: {
                contatoId: usuarioId,
                status: 'pendente',
                dataExpiracao: { gt: anterior }
            },
            select: { id: true, dataExpiracao: true }
        });

        for (const { id, dataExpiracao } of convites) {
            const ocorrencia = `${id}:${dataExpiracao.toISOString()}`;
            const comum = {
                usuarioId,
                tipoOrigem: 'rede_apoio',
                origemId: id,
                ocorrencia
            };

            if (dataExpiracao > agora && permiteNotificacao(preferencia, proximidade)) {
                await agendarEvento(prisma, {
                    ...comum,
                    evento: proximidade,
                    dataHoraProgramada: new Date(+dataExpiracao - dia),
                    expiraEm: dataExpiracao
                });
            }

            if (permiteNotificacao(preferencia, expirado))
                await agendarEvento(prisma, {
                    ...comum,
                    evento: expirado,
                    dataHoraProgramada: dataExpiracao,
                    expiraEm: new Date(+dataExpiracao + dia)
                });
        }
    }

    if (incluirConsentimento && permiteNotificacao(preferencia, consentimentoExpirado)) {
        const consentimento = await prisma.consentimentoParental.findFirst({
            where: {
                titularMenorId: usuarioId,
                validadeLink: { gt: anterior },
                statusConsentimento: { in: ['pendente', 'expirado'] }
            }
        });

        if (consentimento)
            await agendarEvento(prisma, {
                usuarioId,
                tipoOrigem: 'rede_apoio',
                origemId: consentimento.id,
                evento: consentimentoExpirado,
                ocorrencia: consentimento.validadeLink.toISOString(),
                dataHoraProgramada: consentimento.validadeLink,
                expiraEm: new Date(+consentimento.validadeLink + dia)
            });
    }
}
