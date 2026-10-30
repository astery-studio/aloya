// Uma única gravação conserva a fila inteira; falhas de rede nunca removem a marcação local.
function criarMenstruationSyncQueue({ ler, salvar, registrar, identificar, criarChave }) {
    let executando = Promise.resolve();
    const serializar = (acao) => {
        const proxima = executando.then(acao);
        executando = proxima.catch(() => undefined);
        return proxima;
    };
    async function contexto() {
        const identidade = await identificar();
        if (!identidade) throw new Error('Entre novamente para registrar sua menstruação.');
        const chave = `aloya.menstruacao.${identidade}`;
        const valor = await ler(chave);
        return { identidade, chave, fila: valor ? JSON.parse(valor) : [] };
    }
    async function conferirIdentidade(identidade) {
        if ((await identificar()) !== identidade) throw new Error('A sessão foi alterada.');
    }
    return Object.freeze({
        listar: () => serializar(async () => (await contexto()).fila),
        adicionar: (inicio, fim) =>
            serializar(async () => {
                const ctx = await contexto();
                const existente = ctx.fila.find(
                    (item) => item.inicio === inicio && item.fim === fim
                );
                if (existente) return existente;
                if (ctx.fila.length >= 8)
                    throw new Error('Sincronize os registros pendentes antes de adicionar outros.');
                const item = { inicio, fim, chave: criarChave(), status: 'pendente' };
                await conferirIdentidade(ctx.identidade);
                await salvar(ctx.chave, JSON.stringify([...ctx.fila, item]));
                return item;
            }),
        sincronizar: () =>
            serializar(async () => {
                const ctx = await contexto();
                while (ctx.fila.length) {
                    await conferirIdentidade(ctx.identidade);
                    const item = ctx.fila[0];
                    try {
                        await registrar({ ...item, identidade: ctx.identidade });
                    } catch (erro) {
                        item.status = 'falha';
                        item.codigo = erro.codigo;
                        await salvar(ctx.chave, JSON.stringify(ctx.fila));
                        throw erro;
                    }
                    // Se o servidor confirmou e a gravação local falhar, a mesma chave permite repetir sem duplicar.
                    await conferirIdentidade(ctx.identidade);
                    const restantes = ctx.fila.slice(1);
                    await salvar(ctx.chave, JSON.stringify(restantes));
                    ctx.fila = restantes;
                }
            })
    });
}
export { criarMenstruationSyncQueue };
