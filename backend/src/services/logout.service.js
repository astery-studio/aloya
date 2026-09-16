//Revoga apenas a sessão autenticada que solicitou o logout
function criarLogoutService({ prisma }) {

    //Não permite que valores ausentes ampliem acidentalmente o filtro do Prisma
    function validarIdentidadeDaSessao({ usuarioId, sessaoId }) {
        if (
            !Number.isSafeInteger(usuarioId) || usuarioId <= 0 ||
            !Number.isSafeInteger(sessaoId) || sessaoId <= 0
        ) {
            const erro = new Error(
                'Sua sessão não está mais ativa.'
            )

            erro.status = 401
            erro.codigo = 'SESSAO_INVALIDA'

            throw erro
        }
    }

    async function encerrarSessao({ usuarioId, sessaoId }) {
        validarIdentidadeDaSessao({ usuarioId, sessaoId })

        //Uma única operação no banco revoga somente a sessão atual. O filtro também impede revogar uma sessão pertencente a outra pessoa.
        const resultado = await prisma.sessao.updateMany({
            where: {
                id: sessaoId,
                usuarioId,
                revogadaEm: null
            },

            data: {
                revogadaEm: new Date()
            }
        })

        //Não informa sucesso se a sessão já desapareceu ou mudou entre a autenticação da requisição e a tentativa de revogação.
        if (resultado.count !== 1) {
            const erro = new Error(
                'Sua sessão não está mais ativa.'
            )

            erro.status = 401
            erro.codigo = 'SESSAO_INVALIDA'

            throw erro
        }
    }

    return { encerrarSessao }
}

export { criarLogoutService }