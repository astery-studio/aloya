//Reúne cadastro, login, recuperação de senha e logout em um único serviço de autenticação.
import { endpoints } from '../../../services/api/endpoints'

const mensagemErroConfiguracao = 'Não foi possível configurar o serviço de autenticação.'
const mensagemErroCredencial = 'Não foi possível remover a credencial deste aparelho. Tente novamente.'

//Recebe as dependências do serviço e impede configurações incompletas ou inválidas.
function validarDependencias({requisicao, requisicaoAutenticada, removerCredencialLocal}) {
    const possuiRequisicaoPublica = typeof requisicao === 'function'
    const possuiRequisicaoAutenticada = typeof requisicaoAutenticada === 'function'
    const possuiRemocaoLocal = typeof removerCredencialLocal === 'function'
    const possuiLogoutCompleto = possuiRequisicaoAutenticada && possuiRemocaoLocal
    const recebeuParteDoLogout = requisicaoAutenticada !== undefined || removerCredencialLocal !== undefined

    if (!possuiRequisicaoPublica && !possuiLogoutCompleto) {
        throw new Error(mensagemErroConfiguracao)
    }

    if (recebeuParteDoLogout && !possuiLogoutCompleto) {
        throw new Error(mensagemErroConfiguracao)
    }
}

//Cria o serviço que envia as operações de autenticação para a API e remove a sessão local no logout.
function criarAuthService({requisicao, requisicaoAutenticada, removerCredencialLocal} = {}) {
    validarDependencias({
        requisicao,
        requisicaoAutenticada,
        removerCredencialLocal
    })

    let encerramentoEmAndamento = null

    //Impede que uma operação pública seja executada sem o cliente HTTP necessário.
    function exigirRequisicaoPublica() {
        if (typeof requisicao !== 'function') {
            throw new Error(mensagemErroConfiguracao)
        }
    }

    //Impede que o logout seja iniciado sem acesso à API autenticada e ao armazenamento seguro.
    function exigirDependenciasDoLogout() {
        if (typeof requisicaoAutenticada !== 'function' || typeof removerCredencialLocal !== 'function') {
            throw new Error(mensagemErroConfiguracao)
        }
    }

    //Recebe os dados do cadastro e devolve a resposta da API.
    function cadastrar(dados) {
        exigirRequisicaoPublica()

        return requisicao({
            metodo: 'POST',
            caminho: endpoints.cadastro,
            corpo: dados
        })
    }

    //Recebe as credenciais de acesso e devolve a sessão criada pela API.
    function realizarLogin(credenciais) {
        exigirRequisicaoPublica()

        return requisicao({
            metodo: 'POST',
            caminho: endpoints.login,
            corpo: credenciais
        })
    }

    //Recebe um e-mail e consulta se ele pode ser usado no cadastro.
    function verificarEmailDisponivel(email) {
        exigirRequisicaoPublica()

        return requisicao({
            metodo: 'POST',
            caminho: endpoints.disponibilidadeEmail,
            corpo: { email }
        })
    }

    //Recebe um e-mail e solicita o envio das instruções de recuperação.
    function solicitarRecuperacao({email}) {
        exigirRequisicaoPublica()

        return requisicao({
            metodo: 'POST',
            caminho: endpoints.solicitarRecuperacao,
            corpo: { email }
        })
    }

    //Recebe o token do link e verifica se ele ainda pode ser utilizado.
    function validarTokenRecuperacao(token) {
        exigirRequisicaoPublica()

        return requisicao({
            caminho: `${endpoints.validarRecuperacao}/${encodeURIComponent(token)}`
        })
    }

    //Recebe o token e a nova senha para concluir a recuperação.
    function redefinirSenha({token, senha}) {
        exigirRequisicaoPublica()

        return requisicao({
            metodo: 'POST',
            caminho: endpoints.redefinirSenha,
            corpo: { token, senha }
        })
    }

    //Tenta revogar a sessão no servidor sem impedir a limpeza segura do aparelho.
    async function tentarEncerrarSessaoNoServidor() {
        try {
            const resposta = await requisicaoAutenticada({
                metodo: 'POST',
                caminho: endpoints.logout
            })

            return resposta?.status === 204
        } catch {
            return false
        }
    }

    //Remove a credencial local sem expor detalhes internos do armazenamento.
    async function removerSessaoDoAparelho() {
        try {
            await removerCredencialLocal()
        } catch {
            throw new Error(mensagemErroCredencial)
        }
    }

    //Executa o encerramento remoto e garante que a credencial seja removida do aparelho.
    async function executarEncerramento() {
        const encerramentoRemoto = tentarEncerrarSessaoNoServidor()

        await removerSessaoDoAparelho()

        const sessaoRemotaEncerrada = await encerramentoRemoto

        return Object.freeze({
            sessaoLocalEncerrada: true,
            sessaoRemotaEncerrada
        })
    }

    //Encerra a sessão e reutiliza a mesma operação caso o botão seja pressionado mais de uma vez.
    function encerrarSessao() {
        exigirDependenciasDoLogout()

        if (encerramentoEmAndamento) {
            return encerramentoEmAndamento
        }

        encerramentoEmAndamento = executarEncerramento().finally(() => {
            encerramentoEmAndamento = null
        })

        return encerramentoEmAndamento
    }

    return {
        cadastrar,
        realizarLogin,
        verificarEmailDisponivel,
        solicitarRecuperacao,
        validarTokenRecuperacao,
        redefinirSenha,
        encerrarSessao
    }
}

export { criarAuthService }