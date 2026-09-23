//Define o formato dos dados de perfil usados pelo frontend.
//Existe para aceitar somente os campos de perfil necessários, sem levar outros dados da resposta da API para a interface

function criarUserProfile(respostaApi) {
    const dados = respostaApi?.configuracoes

    const dadosValidos =
        dados !== null
        && typeof dados === 'object'
        && !Array.isArray(dados)
        && Number.isSafeInteger(dados.id)
        && dados.id > 0
        && typeof dados.nome === 'string'
        && typeof dados.email === 'string'
        && (dados.identidadeGenero === null || typeof dados.identidadeGenero === 'string')
        && typeof dados.dataNascimento === 'string'
        && /^\d{4}-\d{2}-\d{2}$/.test(dados.dataNascimento)
        && typeof dados.atualizadoEm === 'string'

    if (!dadosValidos) {
        throw new Error(
            'Não foi possível carregar os dados do perfil.'
        )
    }

    return Object.freeze({
        id: dados.id,
        nome: dados.nome,
        email: dados.email,
        identidadeGenero: dados.identidadeGenero,
        dataNascimento: dados.dataNascimento,
        atualizadoEm: dados.atualizadoEm
    })
}

export { criarUserProfile }
/**
 * Normaliza respostas de perfil para o formato mínimo usado pela interface.
 */
