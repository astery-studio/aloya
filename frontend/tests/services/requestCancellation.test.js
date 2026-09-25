jest.mock('../../services/auth/tokenStorage', () => ({
    obterToken: jest.fn().mockResolvedValue({
        token: 'token-seguro'
    }),
    removerToken: jest.fn().mockResolvedValue(undefined)
}))

import {criarApiClient} from '../../services/api/apiClient'
import {criarServicosApp} from '../../services/createAppServices'

function criarErroAbortado() {
    const erro = new Error('A requisição foi cancelada.')
    erro.name = 'AbortError'
    return erro
}

test('repassa o sinal de cancelamento pelo cliente HTTP', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
            get: jest.fn(() => 'application/json')
        },
        text: async () => JSON.stringify({
            configuracoes: {}
        })
    })

    const cliente = criarApiClient({
        baseUrl: 'https://api.exemplo.com',
        fetchImpl
    })

    const controlador = new AbortController()

    await cliente.requisicao({
        caminho: '/users/me',
        signal: controlador.signal
    })

    expect(fetchImpl).toHaveBeenCalledWith(
        'https://api.exemplo.com/users/me',
        expect.objectContaining({
            signal: controlador.signal
        })
    )
})

test('cancela a busca quando o sinal externo é abortado', async () => {
    const fetchImpl = jest.fn((_, opcoes) => new Promise((_, rejeitar) => {
        opcoes.signal.addEventListener('abort', () => {
            rejeitar(criarErroAbortado())
        }, {
            once: true
        })
    }))

    const servicos = criarServicosApp({
        apiUrl: 'https://api.exemplo.com',
        fetchImpl
    })

    const controlador = new AbortController()
    const busca = servicos.accountService.buscarPerfil({
        signal: controlador.signal
    })

    await new Promise((resolver) => setTimeout(resolver, 0))

    expect(fetchImpl).toHaveBeenCalledTimes(1)

    controlador.abort()

    await expect(busca).rejects.toMatchObject({
        name: 'AbortError',
        message: 'A requisição foi cancelada.'
    })
})