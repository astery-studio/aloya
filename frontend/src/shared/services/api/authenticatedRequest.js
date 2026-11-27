//Adiciona com segurança o token da sessão nas requisições privadas da aplicação.
const codigosDeSessaoInvalida = new Set(['NAO_AUTENTICADO', 'TOKEN_INVALIDO', 'SESSAO_INVALIDA']);

function criarErroSessaoAusente() {
    const erro = new Error('Sua sessão expirou. Entre novamente.');

    erro.status = 401;
    erro.codigo = 'SESSAO_AUSENTE';
    erro.mensagemUsuario = erro.message;

    return erro;
}

// O armazenamento nativo pode não responder; a espera precisa terminar mesmo sem resposta.
async function aguardarArmazenamento(operacao, signal, timeoutMs) {
    let temporizador;
    let cancelar;
    const interrupcao = new Promise((_, rejeitar) => {
        cancelar = () => {
            const erro = new Error('Requisição cancelada.');
            erro.name = 'AbortError';
            rejeitar(erro);
        };
        temporizador = setTimeout(() => {
            const erro = new Error('Não foi possível acessar sua sessão. Tente novamente.');
            erro.codigo = 'TEMPO_ARMAZENAMENTO_ESGOTADO';
            erro.mensagemUsuario = erro.message;
            rejeitar(erro);
        }, timeoutMs);
        signal?.addEventListener('abort', cancelar, { once: true });
    });

    try {
        if (signal?.aborted) cancelar();
        return await Promise.race([signal?.aborted ? interrupcao : operacao(), interrupcao]);
    } finally {
        clearTimeout(temporizador);
        signal?.removeEventListener('abort', cancelar);
    }
}

function criarRequisicaoAutenticada({
    requisicao,
    obterCredencial,
    removerCredencial,
    timeoutMs = 15000
}) {
    if (
        typeof requisicao !== 'function' ||
        typeof obterCredencial !== 'function' ||
        typeof removerCredencial !== 'function'
    ) {
        throw new Error('Não foi possível configurar as requisições autenticadas.');
    }

    return async function requisicaoAutenticada(opcoes = {}) {
        const sessao = await aguardarArmazenamento(obterCredencial, opcoes.signal, timeoutMs);
        if (opcoes.signal?.aborted) {
            const erro = new Error('Requisição cancelada.');
            erro.name = 'AbortError';
            throw erro;
        }
        const token = sessao?.token;

        if (typeof token !== 'string' || !token.trim()) {
            await aguardarArmazenamento(removerCredencial, opcoes.signal, timeoutMs).catch(
                () => undefined
            );
            throw criarErroSessaoAusente();
        }

        const opcoesSeguras = { ...opcoes };
        delete opcoesSeguras.token;
        delete opcoesSeguras.validarCredencial;
        if (opcoes.validarCredencial && !opcoes.validarCredencial(sessao)) {
            throw criarErroSessaoAusente();
        }

        try {
            return await requisicao({ ...opcoesSeguras, token });
        } catch (erro) {
            const sessaoInvalida =
                erro?.status === 401 && codigosDeSessaoInvalida.has(erro?.codigo);

            if (sessaoInvalida) {
                await aguardarArmazenamento(removerCredencial, opcoes.signal, timeoutMs).catch(
                    () => undefined
                );
            }

            throw erro;
        }
    };
}

export { criarRequisicaoAutenticada };
