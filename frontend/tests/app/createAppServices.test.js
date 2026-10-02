//Testa a configuração segura dos serviços usados pela aplicação.
import { criarAuthService } from '../../src/features/auth/services/authService'
import { criarAccountService } from '../../src/features/settings/services/accountService'
import { criarContraceptiveService } from '../../src/features/contraceptives/services/contraceptiveService'
import { criarServicosApp } from '../../src/app/createAppServices'
import { criarApiClient } from '../../src/shared/services/api/apiClient'
import { criarRequisicaoAutenticada } from '../../src/shared/services/api/authenticatedRequest'
import { obterToken, removerToken } from '../../src/shared/storage/tokenStorage'

jest.mock('../../src/features/auth/services/authService', () => ({
    criarAuthService: jest.fn()
}))

jest.mock('../../src/features/settings/services/accountService', () => ({
    criarAccountService: jest.fn()
}))

jest.mock('../../src/features/contraceptives/services/contraceptiveService', () => ({
    criarContraceptiveService: jest.fn()
}))

jest.mock('../../src/shared/services/api/apiClient', () => ({
    criarApiClient: jest.fn()
}))

jest.mock('../../src/shared/services/api/authenticatedRequest', () => ({
    criarRequisicaoAutenticada: jest.fn()
}))

jest.mock('../../src/shared/storage/tokenStorage', () => ({
    obterToken: jest.fn(),
    removerToken: jest.fn()
}))

describe('createAppServices', () => {
    let requisicao
    let requisicaoAutenticada
    let authService
    let accountService
    let contraceptiveService

    beforeEach(() => {
        jest.clearAllMocks()

        requisicao = jest.fn()
        requisicaoAutenticada = jest.fn()
        authService = Object.freeze({
            nome: 'authService'
        })
        accountService = Object.freeze({
            nome: 'accountService'
        })
        contraceptiveService = Object.freeze({
            nome: 'contraceptiveService'
        })

        criarApiClient.mockReturnValue({
            requisicao
        })

        criarRequisicaoAutenticada.mockReturnValue(
            requisicaoAutenticada
        )

        criarAuthService.mockReturnValue(
            authService
        )

        criarAccountService.mockReturnValue(
            accountService
        )

        criarContraceptiveService.mockReturnValue(
            contraceptiveService
        )
    })

    test('monta e congela os serviços da aplicação', () => {
        const fetchImpl = jest.fn()

        const servicos = criarServicosApp({
            apiUrl: ' https://api.aloya.com/ ',
            fetchImpl
        })

        expect(criarApiClient).toHaveBeenCalledWith({
            baseUrl: 'https://api.aloya.com',
            fetchImpl,
            timeoutMs: 15000
        })

        expect(criarRequisicaoAutenticada).toHaveBeenCalledWith({
            requisicao,
            obterCredencial: obterToken,
            removerCredencial: removerToken
        })

        expect(criarAuthService).toHaveBeenCalledWith({
            requisicao,
            requisicaoAutenticada,
            removerCredencialLocal: removerToken
        })

        expect(criarAccountService).toHaveBeenCalledWith({
            requisicaoAutenticada,
            removerCredencialLocal: removerToken
        })

        expect(criarContraceptiveService).toHaveBeenCalledWith({
            requisicaoAutenticada
        })

        expect(servicos).toEqual({
            authService,
            accountService,
            contraceptiveService
        })

        expect(Object.isFrozen(servicos)).toBe(true)
    })

    test('usa a URL configurada no ambiente', () => {
        const apiUrlAnterior = process.env.EXPO_PUBLIC_API_URL
        process.env.EXPO_PUBLIC_API_URL = 'https://api.aloya.com/'

        try {
            const fetchImpl = jest.fn()

            criarServicosApp({
                fetchImpl
            })

            expect(criarApiClient).toHaveBeenCalledWith({
                baseUrl: 'https://api.aloya.com',
                fetchImpl,
                timeoutMs: 15000
            })
        } finally {
            if (apiUrlAnterior === undefined) {
                delete process.env.EXPO_PUBLIC_API_URL
            } else {
                process.env.EXPO_PUBLIC_API_URL = apiUrlAnterior
            }
        }
    })

    test.each([
        null,
        '',
        '   ',
        123
    ])('rejeita uma URL ausente ou inválida: %p', (apiUrl) => {
        expect(() => criarServicosApp({
            apiUrl,
            fetchImpl: jest.fn()
        })).toThrow('A URL da API não foi configurada.')
    })

    test('rejeita uma URL malformada', () => {
        expect(() => criarServicosApp({
            apiUrl: 'api-invalida',
            fetchImpl: jest.fn()
        })).toThrow()
    })

    test.each([
        'http://api.aloya.com',
        'https://usuario:senha@api.aloya.com',
        'https://api.aloya.com?ambiente=teste',
        'https://api.aloya.com#configuracao'
    ])('rejeita uma URL insegura: %s', (apiUrl) => {
        expect(() => criarServicosApp({
            apiUrl,
            fetchImpl: jest.fn()
        })).toThrow('A URL da API precisa utilizar HTTPS.')
    })

    test('permite HTTP somente quando o modo de desenvolvimento é solicitado', () => {
        const fetchImpl = jest.fn()

        criarServicosApp({
            apiUrl: 'http://10.0.2.2:3000/',
            fetchImpl,
            permitirHttpDesenvolvimento: true
        })

        expect(criarApiClient).toHaveBeenCalledWith({
            baseUrl: 'http://10.0.2.2:3000',
            fetchImpl,
            timeoutMs: 15000
        })
    })
})