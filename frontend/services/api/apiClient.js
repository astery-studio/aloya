/**
 * Cliente HTTP que serializa requisições e normaliza erros retornados pela API.
 */
function criarApiClient({ baseUrl, fetchImpl = fetch, timeoutMs = 10000 }) {
    async function requisicao({ caminho, metodo = 'GET', corpo, token }) {
        const controle = new AbortController();
        const temporizador = setTimeout(() => controle.abort(), timeoutMs);
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
            const erro = new Error(falha.name === 'AbortError'
                ? 'A API não respondeu dentro do tempo esperado.'
                : 'Não foi possível conectar ao servidor.');
            erro.mensagemUsuario = erro.message;
            throw erro;
        } finally {
            clearTimeout(temporizador);
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

    return { requisicao };
}

export { criarApiClient };
