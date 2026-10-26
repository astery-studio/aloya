//Valida e normaliza os dados usados para criar uma categoria de permissão.
import { ordenarPermissoesCategoria, permissaoCategoriaEhValida, permissoesDaCategoria } from '../constants/permissionCategory.constants.js'

const TAMANHO_MAXIMO_NOME = 80
const FORMATO_ID = /^[1-9]\d*$/u
const CAMPOS_PERMITIDOS = Object.freeze(['nome', 'dadosVisiveis'])
const CAMPOS_PERMITIDOS_EDICAO = Object.freeze([
    ...CAMPOS_PERMITIDOS,
    'atualizadoEm',
    'quantidadeContatosConfirmada'
])

//Cria um erro de validação associado ao campo que precisa ser corrigido.
function criarErro(campo, mensagem) {
    return {campo, mensagem}
}

//Confirma que o corpo recebido é um objeto JSON simples e seguro.
function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
        return false
    }

    const prototipo = Object.getPrototypeOf(valor)

    return prototipo === Object.prototype || prototipo === null
}

//Remove espaços excedentes sem modificar a forma legível do nome.
function normalizarNome(nome) {
    return nome.normalize('NFKC').trim().replace(/\s+/gu, ' ')
}

//Gera a versão usada exclusivamente para comparar nomes sem diferenciar maiúsculas e minúsculas.
function criarNomeNormalizado(nome) {
    return nome.toLocaleLowerCase('pt-BR')
}

//Converte o parâmetro da rota em um identificador inteiro positivo seguro.
function validarIdCategoria(idRecebido) {
    const idTexto = typeof idRecebido === 'number' ? String(idRecebido) : idRecebido

    if (typeof idTexto !== 'string' || !FORMATO_ID.test(idTexto)) {
        throw new TypeError('Identificador de categoria inválido.')
    }

    const id = Number(idTexto)

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new TypeError('Identificador de categoria inválido.')
    }

    return id
}

//Valida o nome da categoria e devolve suas versões segura e normalizada.
function validarNome(nomeRecebido, erros) {
    if (typeof nomeRecebido !== 'string' || nomeRecebido.trim().length === 0) {
        erros.push(criarErro('nome', 'Dê um nome para a categoria.'))

        return {
            nome: '',
            nomeNormalizado: ''
        }
    }

    // A faixa explícita bloqueia caracteres de controle invisíveis na entrada.
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u001F\u007F]/u.test(nomeRecebido)) {
        erros.push(criarErro('nome', 'O nome da categoria contém caracteres não permitidos.'))
    }

    if (/[<>]/u.test(nomeRecebido)) {
        erros.push(criarErro('nome', 'O nome da categoria não pode conter código HTML.'))
    }

    const nome = normalizarNome(nomeRecebido)

    if ([...nome].length > TAMANHO_MAXIMO_NOME) {
        erros.push(criarErro('nome', `O nome da categoria deve possuir no máximo ${TAMANHO_MAXIMO_NOME} caracteres.`))
    }

    return {
        nome,
        nomeNormalizado: criarNomeNormalizado(nome)
    }
}

//Valida a seleção e devolve apenas permissões conhecidas, sem repetições.
function validarDadosVisiveis(dadosRecebidos, erros) {
    if (!Array.isArray(dadosRecebidos) || dadosRecebidos.length === 0) {
        erros.push(criarErro('dadosVisiveis', 'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.'))

        return []
    }

    if (dadosRecebidos.length > permissoesDaCategoria.length) {
        erros.push(criarErro('dadosVisiveis', 'A seleção contém permissões inválidas.'))

        return []
    }

    const possuiPermissaoInvalida = dadosRecebidos.some(permissao => !permissaoCategoriaEhValida(permissao))

    if (possuiPermissaoInvalida) {
        erros.push(criarErro('dadosVisiveis', 'A seleção contém permissões inválidas.'))

        return []
    }

    return ordenarPermissoesCategoria(dadosRecebidos)
}

//Valida a versão apresentada pelo cliente para impedir sobrescritas concorrentes.
function validarAtualizadoEm(atualizadoEm, erros) {
    if (typeof atualizadoEm !== 'string') {
        erros.push(criarErro('atualizadoEm', 'A versão da categoria é inválida.'))
        return null
    }

    const data = new Date(atualizadoEm)

    if (Number.isNaN(data.getTime()) || data.toISOString() !== atualizadoEm) {
        erros.push(criarErro('atualizadoEm', 'A versão da categoria é inválida.'))
        return null
    }

    return data
}

//Aceita a confirmação somente quando ela informa uma quantidade inteira não negativa.
function validarConfirmacaoImpacto(quantidade, erros) {
    if (quantidade === undefined) {
        return null
    }

    if (!Number.isSafeInteger(quantidade) || quantidade < 0) {
        erros.push(criarErro('quantidadeContatosConfirmada', 'A confirmação de impacto é inválida.'))
        return null
    }

    return quantidade
}

//Valida todo o corpo da criação e impede o envio de campos protegidos.
function validarCriacaoCategoria(body) {
    if (!ehObjetoSimples(body)) {
        return {
            valido: false,
            erros: [criarErro('dados', 'O corpo da requisição deve ser um objeto JSON.')],
            dados: {}
        }
    }

    const erros = []
    const camposDesconhecidos = Object.keys(body).filter(campo => !CAMPOS_PERMITIDOS.includes(campo))

    if (camposDesconhecidos.length > 0) {
        erros.push(criarErro('dados', 'A requisição contém campos não permitidos.'))
    }

    const {nome, nomeNormalizado} = validarNome(body.nome, erros)
    const dadosVisiveis = validarDadosVisiveis(body.dadosVisiveis, erros)

    return {
        valido: erros.length === 0,
        erros,
        dados: {
            nome,
            nomeNormalizado,
            dadosVisiveis
        }
    }
}

//Valida a representação completa usada para substituir os dados editáveis da categoria.
function validarEdicaoCategoria(body) {
    if (!ehObjetoSimples(body)) {
        return {
            valido: false,
            erros: [criarErro('dados', 'O corpo da requisição deve ser um objeto JSON.')],
            dados: {}
        }
    }

    const erros = []
    const camposDesconhecidos = Object.keys(body).filter(campo => !CAMPOS_PERMITIDOS_EDICAO.includes(campo))
    const {nome, nomeNormalizado} = validarNome(body.nome, erros)
    const dadosVisiveis = validarDadosVisiveis(body.dadosVisiveis, erros)
    const atualizadoEm = validarAtualizadoEm(body.atualizadoEm, erros)
    const quantidadeContatosConfirmada = validarConfirmacaoImpacto(body.quantidadeContatosConfirmada, erros)

    if (camposDesconhecidos.length > 0) {
        erros.push(criarErro('dados', 'A requisição contém campos não permitidos.'))
    }

    return {
        valido: erros.length === 0,
        erros,
        dados: {
            nome,
            nomeNormalizado,
            dadosVisiveis,
            atualizadoEm,
            quantidadeContatosConfirmada
        }
    }
}

function criarPermissionCategoryValidator() {
    return {
        validarCriacaoCategoria,
        validarEdicaoCategoria,
        validarIdCategoria
    }
}

export { criarPermissionCategoryValidator, validarIdCategoria }
