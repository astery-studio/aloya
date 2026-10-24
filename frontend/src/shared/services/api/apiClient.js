/**
 * Cliente HTTP que serializa requisições e normaliza erros retornados pela API.
 */
function criarApiClient({ baseUrl, fetchImpl = fetch, timeoutMs = 10000 }) {
    //Recebe os dados da requisição e executa uma chamada com timeout e cancelamento seguros.
    async function requisicao({ caminho, metodo = 'GET', corpo, token, signal: sinalExterno }) {
        const controle = new AbortController();
        let tempoEsgotado = false;
        const cancelarPeloChamador = () => controle.abort();

        if (sinalExterno?.aborted) {
            controle.abort();
        } else {
            sinalExterno?.addEventListener?.('abort', cancelarPeloChamador, { once: true });
        }

        const temporizador = setTimeout(() => {
            tempoEsgotado = true;
            controle.abort();
        }, timeoutMs);

        let resposta;

        try {
            resposta = await fetchImpl(`${baseUrl}${caminho}`, {
                method: metodo,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                signal: controle.signal,
                ...(corpo === undefined ? {} : { body: JSON.stringify(corpo) })
            });
        } catch (falha) {
            if (falha?.name === 'AbortError' && sinalExterno?.aborted && !tempoEsgotado) {
                throw falha;
            }

            const mensagem = falha?.name === 'AbortError'
                ? 'A conexão demorou demais. Tente novamente.'
                : 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            const erro = new Error(mensagem);
            erro.mensagemUsuario = mensagem;
            throw erro;
        } finally {
            clearTimeout(temporizador);
            sinalExterno?.removeEventListener?.('abort', cancelarPeloChamador);
        }

        const dados = resposta.status === 204 ? null : await resposta.json();

        if (!resposta.ok) {
            const erro = new Error(dados?.erro?.mensagem || 'Não foi possível concluir a solicitação.');
            erro.mensagemUsuario = erro.message;
            erro.status = resposta.status;
            erro.codigo = dados?.erro?.codigo;
            erro.detalhes = dados?.erro?.detalhes;
            throw erro;
        }

        return dados;
    }

    return {
        requisicao
    };
}

export { criarApiClient };