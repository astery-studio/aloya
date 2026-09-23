//Reúne as operações autenticadas de perfil e exclusão da própria conta.
import { criarUserProfile } from '../../profile/models/userProfile'
import { endpoints } from '../../../services/api/endpoints'

const camposPermitidos = Object.freeze([
    'nome',
    'email',
    'dataNascimento',
    'identidadeGenero'
])

function filtrarAlteracoes(alteracoes) {
    if (alteracoes === null || typeof alteracoes !== 'object' || Array.isArray(alteracoes)) {
        throw new Error('As alterações do perfil são inválidas.')
    }

    const camposRecebidos = Object.keys(alteracoes)
    const possuiCampoProibido = camposRecebidos.some(campo => !camposPermitidos.includes(campo))

    if (possuiCampoProibido || camposRecebidos.length === 0) {
        throw new Error('As alterações do perfil são inválidas.')
    }

    return camposRecebidos.reduce((resultado, campo) => {
        resultado[campo] = alteracoes[campo]
        return resultado
    }, {})
}

function criarAccountService({requisicaoAutenticada, removerCredencialLocal}) {
    if (typeof requisicaoAutenticada !== 'function' || typeof removerCredencialLocal !== 'function') {
        throw new Error('Não foi possível configurar o serviço de conta.')
    }

    let exclusaoEmAndamento = null
    let contaExcluidaNoServidor = false
    let respostaDaExclusao = null
    let verificacaoSenhaEmAndamento = null

    async function buscarPerfil() {
        const resposta = await requisicaoAutenticada({
            caminho: endpoints.configuracoesConta
        })

        return criarUserProfile(resposta)
    }

    async function atualizarPerfil(alteracoes) {
        const dadosSeguros = filtrarAlteracoes(alteracoes)

        const resposta = await requisicaoAutenticada({
            metodo: 'PATCH',
            caminho: endpoints.configuracoesConta,
            corpo: dadosSeguros
        })

        return criarUserProfile(resposta)
    }

    //Confere a senha no backend sem excluir ou modificar dados.
    function confirmarSenhaExclusao({senhaAtual} = {}) {
        if (typeof senhaAtual !== 'string' || senhaAtual.length === 0) {
            const erro = new Error('Informe sua senha atual.')
            erro.codigo = 'SENHA_ATUAL_AUSENTE'
            throw erro
        }

        if (verificacaoSenhaEmAndamento) {
            return verificacaoSenhaEmAndamento
        }

        verificacaoSenhaEmAndamento = requisicaoAutenticada({
            metodo: 'POST',
            caminho: endpoints.verificacaoSenhaExclusao,
            corpo: {senhaAtual}
        }).then(() => true).finally(() => {
            verificacaoSenhaEmAndamento = null
        })

        return verificacaoSenhaEmAndamento
    }

    async function executarExclusao(senhaAtual) {
        if (!contaExcluidaNoServidor) {
            respostaDaExclusao = await requisicaoAutenticada({
                metodo: 'DELETE',
                caminho: endpoints.exclusaoConta,
                corpo: {
                    senhaAtual,
                    confirmarExclusao: true
                }
            })

            contaExcluidaNoServidor = true
        }

        try {
            await removerCredencialLocal()
        } catch {
            const erro = new Error('A conta foi excluída, mas não foi possível limpar a sessão deste aparelho. Tente novamente.')
            erro.codigo = 'LIMPEZA_LOCAL_PENDENTE'
            erro.mensagemUsuario = erro.message
            throw erro
        }

        const resultado = respostaDaExclusao

        contaExcluidaNoServidor = false
        respostaDaExclusao = null

        return resultado
    }

    function excluirConta({senhaAtual} = {}) {
        if (typeof senhaAtual !== 'string' || senhaAtual.length === 0) {
            const erro = new Error('Informe sua senha atual.')
            erro.codigo = 'SENHA_ATUAL_AUSENTE'
            throw erro
        }

        if (exclusaoEmAndamento) {
            return exclusaoEmAndamento
        }

        exclusaoEmAndamento = executarExclusao(senhaAtual).finally(() => {
            exclusaoEmAndamento = null
        })

        return exclusaoEmAndamento
    }

    return {buscarPerfil, atualizarPerfil, confirmarSenhaExclusao, excluirConta}
}

export { criarAccountService }