//Reúne as operações de autenticação do aplicativo.
// Existe para que login, recuperação de senha e logout compartilhem o mesmo serviço, em vez de ficarem duplicados.

import { endpoints } from '../../../services/api/endpoints'


function criarAuthService({
    requisicaoAutenticada,
    removerCredencialLocal
}) {
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

    return { encerrarSessao }
}

export { criarAuthService }