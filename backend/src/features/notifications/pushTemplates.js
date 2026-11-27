import { renderizarAnticoncepcional } from './pushTemplateContraceptive.js';
import { renderizarCiclo } from './pushTemplateCycle.js';
import { renderizarRedeApoio } from './pushTemplateSupport.js';

const discreta = {
    title: 'Lembrete programado',
    body: 'Você possui uma atividade pendente. Abra o aplicativo para conferir.'
};

export async function renderizarPush(prisma, aviso, agora) {
    const usuario = await prisma.usuario.findUnique({
        where: { id: aviso.usuarioId },
        select: {
            dataNascimento: true,
            preferenciaNotificacao: { select: { ajustesPorEvento: true } }
        }
    });
    const maioridade = new Date(agora);
    maioridade.setUTCFullYear(maioridade.getUTCFullYear() - 18);
    if (
        usuario?.preferenciaNotificacao?.ajustesPorEvento?.previaDetalhada !== true ||
        usuario?.dataNascimento > maioridade
    )
        return discreta;
    if (aviso.evento.startsWith('ciclo.'))
        return (await renderizarCiclo(prisma, aviso, agora)) ?? discreta;
    if (aviso.evento.startsWith('anticoncepcional.'))
        return (await renderizarAnticoncepcional(prisma, aviso, agora)) ?? discreta;
    if (aviso.evento.startsWith('redeApoio.'))
        return (await renderizarRedeApoio(prisma, aviso)) ?? discreta;
    return discreta;
}
