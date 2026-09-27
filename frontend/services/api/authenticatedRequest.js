//Adiciona com segurança o token da sessão nas requisições privadas da aplicação.
const codigosDeSessaoInvalida = new Set([
    'NAO_AUTENTICADO',
    'TOKEN_INVALIDO',
    'SESSAO_INVALIDA'
])

function criarErroSessaoAusente() {
    const erro = new Error('Sua sessão expirou. Entre novamente.')

    erro.status = 401
    erro.codigo = 'SESSAO_AUSENTE'
    erro.mensagemUsuario = erro.message

    return erro
}

function criarRequisicaoAutenticada({requisicao, obterCredencial, removerCredencial}) {
    if (typeof requisicao !== 'function' || typeof obterCredencial !== 'function' || typeof removerCredencial !== 'function') {
        throw new Error('Não foi possível configurar as requisições autenticadas.')
    }

    return async function requisicaoAutenticada(opcoes = {}) {
        const sessao = await obterCredencial()
        const token = sessao?.token

        if (typeof token !== 'string' || !token.trim()) {
            await removerCredencial().catch(() => undefined)
            throw criarErroSessaoAusente()
        }

        const opcoesSeguras = {...opcoes}
        delete opcoesSeguras.token

        try {
            return await requisicao({...opcoesSeguras, token})
        } catch (erro) {
            const sessaoInvalida = erro?.status === 401 && codigosDeSessaoInvalida.has(erro?.codigo)

            if (sessaoInvalida) {
                await removerCredencial().catch(() => undefined)
            }

            throw erro
        }
    }
}

export { criarRequisicaoAutenticada }