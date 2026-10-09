//Valida e normaliza os dados usados para criar uma categoria de permissão.
import { ordenarPermissoesCategoria, permissaoCategoriaEhValida, permissoesDaCategoria } from '../constants/permissionCategory.constants.js'

const TAMANHO_MAXIMO_NOME = 80
const CAMPOS_PERMITIDOS = Object.freeze(['nome', 'dadosVisiveis'])

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

//Valida o nome da categoria e devolve suas versões segura e normalizada.
function validarNome(nomeRecebido, erros) {
    if (typeof nomeRecebido !== 'string' || nomeRecebido.trim().length === 0) {
        erros.push(criarErro('nome', 'Dê um nome para a categoria.'))

        return {
            nome: '',
            nomeNormalizado: ''
        }
    }

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

function criarPermissionCategoryValidator() {
    return {
        validarCriacaoCategoria
    }
}

export { criarPermissionCategoryValidator }