/**
 * Reúne operações de conta, autenticação e encerramento seguro da sessão.
 */
import { endpoints } from '../../../services/api/endpoints'

const mensagemErroConfiguracao = 'Não foi possível configurar o serviço de autenticação.'
const mensagemErroCredencial = 'Não foi possível remover a credencial deste aparelho. Tente novamente.'

function validarDependencias({ requisicao, requisicaoAutenticada, removerCredencialLocal }) {
    const possuiRequisicao = typeof requisicao === 'function'
    const possuiLogout = typeof requisicaoAutenticada === 'function'
        && typeof removerCredencialLocal === 'function'
    const logoutIncompleto = requisicaoAutenticada !== undefined
        || removerCredencialLocal !== undefined

    if ((!possuiRequisicao && !possuiLogout) || (logoutIncompleto && !possuiLogout)) {
        throw new Error(mensagemErroConfiguracao)
    }
}

function criarAuthService({ requisicao, requisicaoAutenticada, removerCredencialLocal }) {
    validarDependencias({ requisicao, requisicaoAutenticada, removerCredencialLocal })
    let encerramentoEmAndamento = null

    function cadastrar(dados) {
        return requisicao({ metodo: 'POST', caminho: endpoints.cadastro, corpo: dados })
    }

    function realizarLogin(credenciais) {
        return requisicao({ metodo: 'POST', caminho: endpoints.login, corpo: credenciais })
    }

    function verificarEmailDisponivel(email) {
        return requisicao({ metodo: 'POST', caminho: endpoints.disponibilidadeEmail, corpo: { email } })
    }

    function solicitarRecuperacao({ email }) {
        return requisicao({ metodo: 'POST', caminho: endpoints.solicitarRecuperacao, corpo: { email } })
    }

    function validarTokenRecuperacao(token) {
        return requisicao({ caminho: `${endpoints.validarRecuperacao}/${encodeURIComponent(token)}` })
    }

    function redefinirSenha({ token, senha }) {
        return requisicao({ metodo: 'POST', caminho: endpoints.redefinirSenha, corpo: { token, senha } })
    }

    async function tentarEncerrarSessaoNoServidor() {
        try {
            const resposta = await requisicaoAutenticada({ metodo: 'POST', caminho: endpoints.logout })
            return resposta?.status === 204
        } catch {
            return false
        }
    }

    async function removerSessaoDoAparelho() {
        try {
            await removerCredencialLocal()
        } catch {
            throw new Error(mensagemErroCredencial)
        }
    }

    async function executarEncerramento() {
        const encerramentoRemoto = tentarEncerrarSessaoNoServidor()
        await removerSessaoDoAparelho()
        const sessaoRemotaEncerrada = await encerramentoRemoto
        return Object.freeze({ sessaoLocalEncerrada: true, sessaoRemotaEncerrada })
    }

    function encerrarSessao() {
        if (encerramentoEmAndamento) return encerramentoEmAndamento
        encerramentoEmAndamento = executarEncerramento().finally(() => {
            encerramentoEmAndamento = null
        })
        return encerramentoEmAndamento
    }

    return {
        cadastrar, realizarLogin, verificarEmailDisponivel,
        solicitarRecuperacao, validarTokenRecuperacao, redefinirSenha, encerrarSessao
    }
}

export { criarAuthService }
