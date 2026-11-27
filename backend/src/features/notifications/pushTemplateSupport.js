const modelosDeAcesso = {
    recebido: [
        'Você recebeu um convite especial!',
        (nome) =>
            `${nome} quer ter você por perto em sua jornada. Confira o convite e conheça as permissões de acesso antes de decidir se deseja fazer parte da Rede de Apoio.`
    ],
    acessoAtualizado: [
        'Seu acesso na Rede de Apoio mudou',
        (nome) =>
            `Algumas permissões na Rede de Apoio de ${nome} foram atualizadas. Acesse o aplicativo para conferir as novidades.`
    ],
    acessoRevogado: [
        'Seu acesso na Rede de Apoio foi encerrado',
        (nome) => `Sua participação na Rede de Apoio de ${nome} foi encerrada.`
    ]
};
export async function renderizarRedeApoio(prisma, aviso) {
    const { evento, origemId } = aviso;
    if (evento.startsWith('redeApoio.convites.')) {
        const tipo = evento.split('.').at(-1);
        if (tipo === 'contaExcluida')
            return {
                title: 'Uma conexão de seus contatos foi encerrada',
                body: 'Uma pessoa da sua Rede de Apoio excluiu a conta. O vínculo e o acesso às informações compartilhadas foram encerrados.'
            };
        const vinculo = await prisma.vinculoRedeApoio.findUnique({
            where: { id: origemId },
            select: {
                status: true,
                titular: { select: { nome: true } },
                contato: { select: { nome: true } }
            }
        });
        if (tipo === 'respondido' && vinculo?.contato?.nome) {
            const nome = vinculo.contato.nome;
            return vinculo.status === 'recusado'
                ? {
                      title: 'Seu convite não foi aceito',
                      body: `Seu convite para ${nome} foi recusado.`
                  }
                : {
                      title: 'Seu convite foi aceito!',
                      body: `Seu convite para ${nome} foi aceito. Agora vocês podem compartilhar essa jornada com mais cuidado e conexão.`
                  };
        }
        const modelo = modelosDeAcesso[tipo === 'renovado' ? 'recebido' : tipo];
        if (modelo && vinculo?.titular?.nome)
            return { title: modelo[0], body: modelo[1](vinculo.titular.nome) };
    }
    if (evento === 'redeApoio.ciclo.registro') {
        return {
            title: 'Um novo registro foi compartilhado!',
            body: 'Acesse o aplicativo para acompanhar as informações compartilhadas com você.'
        };
    }
}
