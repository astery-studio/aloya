import {criarAccountService} from '../../features/settings/services/accountService'
import {endpoints} from '../../services/api/endpoints'

const respostaPerfil = {
    configuracoes: {
        id: 1,
        nome: 'Julia',
        email: 'julia@email.com',
        identidadeGenero: 'Mulher Cisgênero',
        dataNascimento: '1999-04-08',
        atualizadoEm: '2026-09-23T10:00:00.000Z',
        consentimentoParentalNecessario: false
    }
}

test('repassa o sinal de cancelamento ao buscar o perfil', async () => {
    const requisicaoAutenticada = jest.fn().mockResolvedValue(respostaPerfil)
    const removerCredencialLocal = jest.fn()
    const controlador = new AbortController()

    const accountService = criarAccountService({
        requisicaoAutenticada,
        removerCredencialLocal
    })

    await expect(accountService.buscarPerfil({
        signal: controlador.signal
    })).resolves.toMatchObject({
        nome: 'Julia',
        email: 'julia@email.com'
    })

    expect(requisicaoAutenticada).toHaveBeenCalledWith({
        caminho: endpoints.configuracoesConta,
        signal: controlador.signal
    })
})

test('mantém a busca compatível quando não recebe sinal', async () => {
    const requisicaoAutenticada = jest.fn().mockResolvedValue(respostaPerfil)

    const accountService = criarAccountService({
        requisicaoAutenticada,
        removerCredencialLocal: jest.fn()
    })

    await accountService.buscarPerfil()

    expect(requisicaoAutenticada).toHaveBeenCalledWith({
        caminho: endpoints.configuracoesConta
    })
})