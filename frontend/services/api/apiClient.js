function criarApiClient({ baseUrl, fetchImpl = fetch }) {
    async function requisicao({ caminho, metodo = 'GET', corpo, token }) {
        const resposta = await fetchImpl(`${baseUrl}${caminho}`, {
            method: metodo,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            ...(corpo === undefined ? {} : { body: JSON.stringify(corpo) })
        });
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
/**
 * Cliente HTTP que serializa requisições e normaliza erros retornados pela API.
 */
