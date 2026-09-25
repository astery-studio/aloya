//Define o formato seguro dos dados de perfil recebidos da API

const diasPorMes = Object.freeze([31,28,31,30,31,30,31,31,30,31,30,31])

function anoEhBissexto(ano) {
    return (
        ano % 400 === 0 || (ano % 4 === 0 && ano % 100 !== 0)
    )
}

function obterDataAtualIso() {
    const hoje = new Date()

    const ano =
        String(
            hoje.getFullYear()
        ).padStart(4, '0')

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, '0')

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, '0')

    return `${ano}-${mes}-${dia}`
}

function dataNascimentoEhValida(valor) {
    if (typeof valor !== 'string') {
        return false
    }

    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)

    if (!partes) {
        return false
    }

    const ano = Number(partes[1])
    const mes = Number(partes[2])
    const dia = Number(partes[3])

    const numerosValidos = Number.isInteger(ano) && ano >= 1 && Number.isInteger(mes) && mes >= 1 && mes <= 12 && Number.isInteger(dia) && dia >= 1

    if (!numerosValidos) {
        return false
    }

    const quantidadeDeDias = mes === 2 && anoEhBissexto(ano) ? 29 : diasPorMes[mes - 1]

    if (dia > quantidadeDeDias) {
        return false
    }

    return valor <= obterDataAtualIso()
}

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
        && dataNascimentoEhValida(dados.dataNascimento)
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