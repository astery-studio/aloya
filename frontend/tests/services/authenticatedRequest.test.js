//Testa a inclusão segura do token e a limpeza de sessões inválidas nas requisições privadas.
import { criarRequisicaoAutenticada } from '../../src/shared/services/api/authenticatedRequest'

function criarDependencias(opcoes = {}) {
    const sessao = Object.hasOwn(opcoes, 'sessao')
        ? opcoes.sessao
        : {
            token: 'token-seguro'
        }
    const resposta = Object.hasOwn(opcoes, 'resposta')
        ? opcoes.resposta
        : {
            sucesso: true
        }

    return {
        requisicao: jest.fn().mockResolvedValue(resposta),
        obterCredencial: jest.fn().mockResolvedValue(sessao),
        removerCredencial: jest.fn().mockResolvedValue(undefined)
    }
}

test.each([
    {
        requisicao: null,
        obterCredencial: jest.fn(),
        removerCredencial: jest.fn()
    },
    {
        requisicao: jest.fn(),
        obterCredencial: null,
        removerCredencial: jest.fn()
    },
    {
        requisicao: jest.fn(),
        obterCredencial: jest.fn(),
        removerCredencial: null
    }
])('rejeita dependências obrigatórias inválidas', (dependencias) => {
    expect(() => criarRequisicaoAutenticada(dependencias)).toThrow(
        'Não foi possível configurar as requisições autenticadas.'
    )
})

test.each([
    null,
    undefined,
    {},
    {
        token: null
    },
    {
        token: 123
    },
    {
        token: ''
    },
    {
        token: '   '
    }
])('rejeita uma sessão sem token válido: %p', async (sessao) => {
    const dependencias = criarDependencias({
        sessao
    })
    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias)

    await expect(requisicaoAutenticada({
        caminho: '/api/anticoncepcionais'
    })).rejects.toMatchObject({
        status: 401,
        codigo: 'SESSAO_AUSENTE',
        mensagemUsuario: 'Sua sessão expirou. Entre novamente.'
    })

    expect(dependencias.removerCredencial).toHaveBeenCalledTimes(1)
    expect(dependencias.requisicao).not.toHaveBeenCalled()
})

test('ignora falha ao limpar uma sessão local sem token', async () => {
    const dependencias = criarDependencias({
        sessao: null
    })
    dependencias.removerCredencial.mockRejectedValue(
        new Error('falha interna do armazenamento')
    )

    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias)

    await expect(requisicaoAutenticada({
        caminho: '/api/anticoncepcionais'
    })).rejects.toMatchObject({
        status: 401,
        codigo: 'SESSAO_AUSENTE'
    })

    expect(dependencias.requisicao).not.toHaveBeenCalled()
})

test('envia somente o token obtido do armazenamento seguro', async () => {
    const dependencias = criarDependencias()
    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias)
    const controlador = new AbortController()
    const corpo = {
        nome: 'Anticoncepcional atualizado'
    }

    await expect(requisicaoAutenticada({
        metodo: 'PUT',
        caminho: '/api/anticoncepcionais/7',
        corpo,
        signal: controlador.signal,
        token: 'token-injetado'
    })).resolves.toEqual({
        sucesso: true
    })

    expect(dependencias.requisicao).toHaveBeenCalledTimes(1)
    expect(dependencias.requisicao).toHaveBeenCalledWith({
        metodo: 'PUT',
        caminho: '/api/anticoncepcionais/7',
        corpo,
        signal: controlador.signal,
        token: 'token-seguro'
    })
    expect(dependencias.obterCredencial).toHaveBeenCalledTimes(1)
    expect(dependencias.removerCredencial).not.toHaveBeenCalled()
})

test('aceita chamada sem objeto de opções', async () => {
    const dependencias = criarDependencias()
    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias)

    await expect(requisicaoAutenticada()).resolves.toEqual({
        sucesso: true
    })

    expect(dependencias.requisicao).toHaveBeenCalledWith({
        token: 'token-seguro'
    })
})

test.each([
    'NAO_AUTENTICADO',
    'TOKEN_INVALIDO',
    'SESSAO_INVALIDA'
])('remove a credencial quando a API rejeita a sessão com %s', async (codigo) => {
    const dependencias = criarDependencias()
    const erroSessao = new Error('Sessão inválida.')
    erroSessao.status = 401
    erroSessao.codigo = codigo
    dependencias.requisicao.mockRejectedValue(erroSessao)

    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias)

    await expect(requisicaoAutenticada({
        caminho: '/api/anticoncepcionais'
    })).rejects.toBe(erroSessao)

    expect(dependencias.removerCredencial).toHaveBeenCalledTimes(1)
})

test('preserva o erro original quando a limpeza da sessão inválida falha', async () => {
    const dependencias = criarDependencias()
    const erroSessao = new Error('Sessão inválida.')
    erroSessao.status = 401
    erroSessao.codigo = 'SESSAO_INVALIDA'
    dependencias.requisicao.mockRejectedValue(erroSessao)
    dependencias.removerCredencial.mockRejectedValue(
        new Error('falha interna do armazenamento')
    )

    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias)

    await expect(requisicaoAutenticada({
        caminho: '/api/anticoncepcionais'
    })).rejects.toBe(erroSessao)

    expect(dependencias.removerCredencial).toHaveBeenCalledTimes(1)
})

test.each([
    {
        status: 401,
        codigo: 'ERRO_DESCONHECIDO'
    },
    {
        status: 403,
        codigo: 'SESSAO_INVALIDA'
    },
    {
        status: 500,
        codigo: 'ERRO_INTERNO'
    }
])('não remove a credencial para um erro que não invalida a sessão: %p', async ({status, codigo}) => {
    const dependencias = criarDependencias()
    const erro = new Error('Falha controlada.')
    erro.status = status
    erro.codigo = codigo
    dependencias.requisicao.mockRejectedValue(erro)

    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias)

    await expect(requisicaoAutenticada({
        caminho: '/api/anticoncepcionais'
    })).rejects.toBe(erro)

    expect(dependencias.removerCredencial).not.toHaveBeenCalled()
})

test('preserva falhas que não são objetos Error', async () => {
    const dependencias = criarDependencias()
    dependencias.requisicao.mockRejectedValue('falha desconhecida')

    const requisicaoAutenticada = criarRequisicaoAutenticada(dependencias)

    await expect(requisicaoAutenticada({
        caminho: '/api/anticoncepcionais'
    })).rejects.toBe('falha desconhecida')

    expect(dependencias.removerCredencial).not.toHaveBeenCalled()
})