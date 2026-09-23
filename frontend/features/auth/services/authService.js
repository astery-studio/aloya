//Reúne as operações de autenticação do aplicativo.
// Existe para que login, recuperação de senha e logout compartilhem o mesmo serviço, em vez de ficarem duplicados.

import { endpoints } from '../../../services/api/endpoints'


function criarAuthService({
    requisicao,
    requisicaoAutenticada,
    removerCredencialLocal
}) {
    function cadastrar(dados) {
        return requisicao({ metodo: 'POST', caminho: endpoints.cadastro, corpo: dados });
    }

    function realizarLogin(credenciais) {
        return requisicao({ metodo: 'POST', caminho: endpoints.login, corpo: credenciais });
    }

    async function encerrarSessao() {
        const resposta = await requisicaoAutenticada({
            metodo: 'POST',
            caminho: endpoints.logout
        })

        if (resposta.status !== 204) {
            throw new Error(
                'Não foi possível encerrar a sessão. Tente novamente.'
            )
        }

        await removerCredencialLocal()
    }

    return { cadastrar, realizarLogin, encerrarSessao }
}

export { criarAuthService }
