const categorias = {
    ciclo: 'ciclo',
    anticoncepcional: 'anticoncepcional',
    redeApoio: 'rede-apoio',
    seguranca: 'seguranca'
};

export function destinoDoEvento(evento) {
    if (evento.startsWith('ciclo.diario.')) return 'diario';
    return {
        ciclo: 'ciclos',
        anticoncepcional: 'anticoncepcionais',
        redeApoio: 'membros',
        seguranca: 'configuracoes'
    }[evento.split('.')[0]];
}

export function criarPayloadPush(notificacao, token, agora, conteudo) {
    const ttl = Math.max(
        0,
        Math.floor(
            ((notificacao.expiraEm?.getTime() ??
                notificacao.dataHoraProgramada.getTime() + 86400000) -
                agora.getTime()) /
                1000
        )
    );
    return {
        to: token,
        title: conteudo.title,
        body: conteudo.body,
        data: { notificacaoId: String(notificacao.id) },
        channelId: categorias[notificacao.evento.split('.')[0]],
        ttl
    };
}

export function criarExpoPushProvider({ fetchImpl = fetch, token } = {}) {
    async function postar(caminho, corpo) {
        const resposta = await fetchImpl(`https://exp.host/--/api/v2/push/${caminho}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(corpo),
            signal: AbortSignal.timeout(10000)
        });
        if (!resposta.ok)
            return {
                status: 'error',
                details: {
                    error:
                        resposta.status === 429 || resposta.status >= 500
                            ? 'Temporario'
                            : 'RequisicaoRecusada'
                }
            };
        return (await resposta.json()).data;
    }
    return {
        enviar: (mensagem) => postar('send', mensagem),
        recibos: (ids) => postar('getReceipts', { ids })
    };
}
