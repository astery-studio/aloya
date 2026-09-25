//Existe para que login, recuperação de senha e logout compartilhem o mesmo serviço, em vez de ficarem duplicados.
import { endpoints } from '../../../services/api/endpoints'

const mensagemErroConfiguracao = 'Não foi possível configurar o serviço de autenticação.'
const mensagemErroCredencial = 'Não foi possível remover a credencial deste aparelho. Tente novamente.'

function validarDependencias({requisicaoAutenticada, removerCredencialLocal}) {
    const dependenciasValidas = typeof requisicaoAutenticada === 'function' && typeof removerCredencialLocal === 'function'

    if (!dependenciasValidas) {
        throw new Error(mensagemErroConfiguracao)
    }
}

function criarAuthService({requisicaoAutenticada, removerCredencialLocal}) {
    validarDependencias({
        requisicaoAutenticada,removerCredencialLocal
    })

    let encerramentoEmAndamento = null

    async function tentarEncerrarSessaoNoServidor() {
        try {
            const resposta =
                await requisicaoAutenticada({
                    metodo: 'POST',
                    caminho: endpoints.logout
                })

            return resposta?.status === 204
        } catch {
            return false
        }
    }

    async function removerSessaoDoAparelho() {
        try {
            await removerCredencialLocal()
        } catch {
            throw new Error(
                mensagemErroCredencial
            )
        }
    }

    async function executarEncerramento() {
        const encerramentoRemoto = tentarEncerrarSessaoNoServidor()

        await removerSessaoDoAparelho()

        const sessaoRemotaEncerrada = await encerramentoRemoto

        return Object.freeze({
            sessaoLocalEncerrada: true,
            sessaoRemotaEncerrada
        })
    }

    function encerrarSessao() {
        if (encerramentoEmAndamento) {
            return encerramentoEmAndamento
        }

        encerramentoEmAndamento = executarEncerramento().finally(() => {
            encerramentoEmAndamento = null
        })

        return encerramentoEmAndamento
    }

    return {
        encerrarSessao
    }
}

export { criarAuthService }