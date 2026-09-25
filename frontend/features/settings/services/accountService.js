//Reúne as operações autenticadas de perfil, senha e exclusão da própria conta.
import { criarUserProfile } from '../../profile/models/userProfile'
import { endpoints } from '../../../services/api/endpoints'

const camposPermitidos = Object.freeze([
    'nome',
    'email',
    'dataNascimento',
    'identidadeGenero'
])

const camposPermitidosAlteracaoSenha = Object.freeze([
    'senhaAtual',
    'novaSenha',
    'confirmacaoNovaSenha'
])

function filtrarDadosAlteracaoSenha(dados) {
    if (dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
        throw new Error('Os dados da alteração de senha são inválidos.')
    }

    const camposRecebidos = Object.keys(dados)
    const possuiCampoProibido = camposRecebidos.some(campo => !camposPermitidosAlteracaoSenha.includes(campo))
    const camposSaoTexto = camposPermitidosAlteracaoSenha.every(campo => typeof dados[campo] === 'string')

    if (possuiCampoProibido || camposRecebidos.length !== camposPermitidosAlteracaoSenha.length || !camposSaoTexto) {
        throw new Error('Os dados da alteração de senha são inválidos.')
    }

    return {
        senhaAtual: dados.senhaAtual,
        novaSenha: dados.novaSenha,
        confirmacaoNovaSenha: dados.confirmacaoNovaSenha
    }
}

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
    let alteracaoSenhaEmAndamento = null

    async function buscarPerfil({signal} = {}) {
        const resposta = await requisicaoAutenticada({
            caminho: endpoints.configuracoesConta,
            ...(signal ? {signal} : {})
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

    function alterarSenha(dados) {
        const dadosSeguros = filtrarDadosAlteracaoSenha(dados)

        if (alteracaoSenhaEmAndamento) {
            return alteracaoSenhaEmAndamento
        }

        alteracaoSenhaEmAndamento = requisicaoAutenticada({
            metodo: 'PATCH',
            caminho: endpoints.alteracaoSenha,
            corpo: dadosSeguros
        }).finally(() => {
            alteracaoSenhaEmAndamento = null
        })

        return alteracaoSenhaEmAndamento
    }

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

    return {
        buscarPerfil,
        atualizarPerfil,
        alterarSenha,
        confirmarSenhaExclusao,
        excluirConta
    }
}

export { criarAccountService }