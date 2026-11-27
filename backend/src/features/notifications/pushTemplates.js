import { renderizarAnticoncepcional } from './pushTemplateContraceptive.js';
import { renderizarCiclo } from './pushTemplateCycle.js';
import { renderizarRedeApoio } from './pushTemplateSupport.js';
import dicasDeApoio from './supportCareTips.json' with { type: 'json' };

const discreta = {
    title: 'Lembrete programado',
    body: 'Você possui uma atividade pendente. Abra o aplicativo para conferir.'
};

const dicaDiscreta = {
    title: 'Uma dica de autocuidado',
    body: 'Abra o Aloya e veja a seção Dicas para hoje.'
};

const avisosCompartilhadosDiscretos = {
    horario: {
        title: 'Lembrete da Rede de Apoio',
        body: 'Há um horário previsto em uma agenda compartilhada. Confira no Aloya.'
    },
    aplicacoesTrocas: {
        title: 'Lembrete da Rede de Apoio',
        body: 'Há uma ação programada em uma agenda compartilhada. Confira no Aloya.'
    },
    fimJanela: {
        title: 'Confirmação pendente na Rede de Apoio',
        body: 'O prazo do lembrete terminou. Você pode conferir o registro compartilhado no Aloya.'
    }
};

export async function renderizarPush(prisma, aviso, agora) {
    if (aviso.evento === 'redeApoio.dicas.apoio') {
        const fase = aviso.ocorrencia?.split(':')[1];
        return Object.hasOwn(dicasDeApoio, fase) ? dicasDeApoio[fase] : discreta;
    }

    if (aviso.evento.startsWith('redeApoio.anticoncepcional.')) {
        const tipo = aviso.evento.split('.').at(-1);
        return (
            avisosCompartilhadosDiscretos[tipo] ?? {
                title: 'Confirmação pendente na Rede de Apoio',
                body: 'Um registro compartilhado ainda aguarda confirmação. Confira no Aloya.'
            }
        );
    }

    if (aviso.evento === 'redeApoio.consentimento.expirado') {
        return {
            title: 'Acesso à Rede de Apoio',
            body: 'O link para liberar sua Rede de Apoio venceu. Abra o Aloya para conferir.'
        };
    }

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
        return aviso.evento.startsWith('ciclo.dicas.') ? dicaDiscreta : discreta;
    if (aviso.evento.startsWith('ciclo.'))
        return (await renderizarCiclo(prisma, aviso, agora)) ?? discreta;
    if (aviso.evento.startsWith('anticoncepcional.'))
        return (await renderizarAnticoncepcional(prisma, aviso, agora)) ?? discreta;
    if (aviso.evento.startsWith('redeApoio.'))
        return (await renderizarRedeApoio(prisma, aviso)) ?? discreta;
    return discreta;
}
