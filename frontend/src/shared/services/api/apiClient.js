/**
 * Cliente HTTP que serializa requisições e normaliza erros retornados pela API.
 */
function criarApiClient({ baseUrl, fetchImpl = fetch, timeoutMs = 10000 }) {
    //Recebe os dados da requisição e executa uma chamada com timeout e cancelamento seguros.
    async function requisicao({
        caminho,
        metodo = 'GET',
        corpo,
        token,
        chaveIdempotencia,
        signal: sinalExterno
    }) {
        const controle = new AbortController();
        let tempoEsgotado = false;
        let rejeitarCancelamento;
        const cancelamento = new Promise((_, rejeitar) => {
            rejeitarCancelamento = rejeitar;
        });
        const interromper = () => {
            const erro = new Error('Requisição cancelada.');
            erro.name = 'AbortError';
            rejeitarCancelamento(erro);
        };
        controle.signal.addEventListener('abort', interromper, { once: true });
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
        let dados;

        try {
            const buscarResposta = async () => {
                resposta = await fetchImpl(`${baseUrl}${caminho}`, {
                    method: metodo,
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(chaveIdempotencia ? { 'Idempotency-Key': chaveIdempotencia } : {}),
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    signal: controle.signal,
                    ...(corpo === undefined ? {} : { body: JSON.stringify(corpo) })
                });
                return resposta.status === 204 ? null : await resposta.json();
            };
            dados = await Promise.race([buscarResposta(), cancelamento]);
        } catch (falha) {
            if (falha?.name === 'AbortError' && sinalExterno?.aborted && !tempoEsgotado) {
                throw falha;
            }
            if (resposta && falha?.name !== 'AbortError' && !tempoEsgotado) throw falha;

            const mensagem =
                falha?.name === 'AbortError'
                    ? 'A conexão demorou demais. Tente novamente.'
                    : 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            const erro = new Error(mensagem);
            erro.codigo = tempoEsgotado ? 'TEMPO_CONEXAO_ESGOTADO' : 'FALHA_CONEXAO';
            erro.mensagemUsuario = mensagem;
            throw erro;
        } finally {
            clearTimeout(temporizador);
            controle.signal.removeEventListener('abort', interromper);
            sinalExterno?.removeEventListener?.('abort', cancelarPeloChamador);
        }

        if (!resposta.ok) {
            const erro = new Error(
                dados?.erro?.mensagem || 'Não foi possível concluir a solicitação.'
            );
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
