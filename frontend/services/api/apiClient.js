/**
 * Cliente HTTP que serializa requisições e normaliza erros retornados pela API.
 */
function criarApiClient({ baseUrl, fetchImpl = fetch }) {
    function respostaPossuiFormatoJson(resposta) {
        const contentType = resposta.headers?.get?.('content-type');

        if (typeof contentType !== 'string' || !contentType.trim()) {
            return true;
        }

        const tipoNormalizado = contentType.toLowerCase();

        return tipoNormalizado.includes('application/json')
            || tipoNormalizado.includes('+json');
    }

    async function lerDadosDaResposta(resposta) {
        if (resposta.status === 204) {
            return {
                dados: null,
                formatoValido: true
            };
        }

        if (!respostaPossuiFormatoJson(resposta)) {
            return {
                dados: null,
                formatoValido: false
            };
        }

        if (typeof resposta.text === 'function') {
            try {
                const texto = await resposta.text();

                if (!texto.trim()) {
                    return {
                        dados: null,
                        formatoValido: false
                    };
                }

                return {
                    dados: JSON.parse(texto),
                    formatoValido: true
                };
            } catch {
                return {
                    dados: null,
                    formatoValido: false
                };
            }
        }

        if (typeof resposta.json === 'function') {
            try {
                return {
                    dados: await resposta.json(),
                    formatoValido: true
                };
            } catch {
                return {
                    dados: null,
                    formatoValido: false
                };
            }
        }

        return {
            dados: null,
            formatoValido: false
        };
    }

    function criarErroResposta({ resposta, dados, formatoValido }) {
        const erro = new Error(
            formatoValido
                ? dados?.erro?.mensagem
                    || 'Não foi possível concluir a solicitação.'
                : 'Não foi possível interpretar a resposta do servidor.'
        );

        erro.mensagemUsuario = 'Não foi possível concluir a solicitação.';
        erro.status = resposta.status;
        erro.codigo = formatoValido
            ? dados?.erro?.codigo
            : 'RESPOSTA_INVALIDA';
        erro.detalhes = formatoValido
            ? dados?.erro?.detalhes
            : undefined;

        return erro;
    }

    async function requisicao({ caminho, metodo = 'GET', corpo, token }) {
        const resposta = await fetchImpl(`${baseUrl}${caminho}`, {
            method: metodo,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(token ? {
                    Authorization: `Bearer ${token}`
                } : {})
            },
            ...(corpo === undefined ? {} : {
                body: JSON.stringify(corpo)
            })
        });

        const { dados, formatoValido } = await lerDadosDaResposta(resposta);

        if (!resposta.ok) {
            throw criarErroResposta({
                resposta,
                dados,
                formatoValido
            });
        }

        if (!formatoValido) {
            throw criarErroResposta({
                resposta,
                dados,
                formatoValido
            });
        }

        return dados;
    }

    return {
        requisicao
    };
}

export { criarApiClient };