//Testa a configuração segura dos serviços usados pela aplicação.
import { criarAuthService } from '../../features/auth/services/authService'
import { criarAccountService } from '../../features/settings/services/accountService'
import { criarContraceptiveService } from '../../features/contraceptives/services/contraceptiveService'
import { criarSupportCategoryService } from '../../features/support-network/services/supportCategoryService'
import { criarServicosApp } from '../../services/createAppServices'
import { criarApiClient } from '../../services/api/apiClient'
import { criarRequisicaoAutenticada } from '../../services/api/authenticatedRequest'
import { obterToken, removerToken } from '../../services/auth/tokenStorage'

jest.mock(
    '../../features/auth/services/authService',
    () => ({
        criarAuthService: jest.fn()
    })
)

jest.mock(
    '../../features/settings/services/accountService',
    () => ({
        criarAccountService: jest.fn()
    })
)

jest.mock(
    '../../features/contraceptives/services/contraceptiveService',
    () => ({
        criarContraceptiveService: jest.fn()
    })
)

jest.mock(
    '../../features/support-network/services/supportCategoryService',
    () => ({ criarSupportCategoryService: jest.fn() })
)

jest.mock(
    '../../services/api/apiClient',
    () => ({
        criarApiClient: jest.fn()
    })
)

jest.mock(
    '../../services/api/authenticatedRequest',
    () => ({
        criarRequisicaoAutenticada: jest.fn()
    })
)

jest.mock(
    '../../services/auth/tokenStorage',
    () => ({
        obterToken: jest.fn(),
        removerToken: jest.fn()
    })
)

describe('createAppServices', () => {
    let requisicao
    let requisicaoAutenticada
    let authService
    let accountService
    let contraceptiveService
    let supportCategoryService
    let fetchSeguro

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
        supportCategoryService = Object.freeze({ nome: 'supportCategoryService' })
        fetchSeguro = null

        criarApiClient.mockImplementation(
            ({fetchImpl}) => {
                fetchSeguro = fetchImpl

                return {
                    requisicao
                }
            }
        )

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
        criarSupportCategoryService.mockReturnValue(supportCategoryService)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test('monta e congela os serviços da aplicação', () => {
        const fetchImpl = jest.fn()

        const servicos = criarServicosApp({
            apiUrl: ' https://api.aloya.com/ ',
            fetchImpl
        })

        expect(criarApiClient).toHaveBeenCalledWith({
            baseUrl: 'https://api.aloya.com',
            fetchImpl: expect.any(Function)
        })

        expect(
            criarRequisicaoAutenticada
        ).toHaveBeenCalledWith({
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
        expect(criarSupportCategoryService).toHaveBeenCalledWith({ requisicaoAutenticada })

        expect(servicos).toEqual({
            authService,
            accountService,
            contraceptiveService,
            supportCategoryService
        })

        expect(
            Object.isFrozen(servicos)
        ).toBe(true)
    })

    test('usa a URL configurada no ambiente', () => {
        const apiUrlAnterior =
            process.env.EXPO_PUBLIC_API_URL

        process.env.EXPO_PUBLIC_API_URL =
            'https://api.aloya.com/'

        try {
            criarServicosApp({
                fetchImpl: jest.fn()
            })

            expect(criarApiClient).toHaveBeenCalledWith({
                baseUrl: 'https://api.aloya.com',
                fetchImpl: expect.any(Function)
            })
        } finally {
            if (apiUrlAnterior === undefined) {
                delete process.env.EXPO_PUBLIC_API_URL
            } else {
                process.env.EXPO_PUBLIC_API_URL =
                    apiUrlAnterior
            }
        }
    })

    test.each([
        null,
        '',
        '   ',
        123
    ])(
        'rejeita uma URL ausente ou inválida: %p',
        (apiUrl) => {
            expect(
                () => criarServicosApp({
                    apiUrl,
                    fetchImpl: jest.fn()
                })
            ).toThrow(
                'A URL da API não foi configurada.'
            )
        }
    )

    test('rejeita uma URL malformada', () => {
        expect(
            () => criarServicosApp({
                apiUrl: 'api-invalida',
                fetchImpl: jest.fn()
            })
        ).toThrow()
    })

    test.each([
        'http://api.aloya.com',
        'https://usuario:senha@api.aloya.com',
        'https://api.aloya.com?ambiente=teste',
        'https://api.aloya.com#configuracao'
    ])(
        'rejeita uma URL insegura: %s',
        (apiUrl) => {
            expect(
                () => criarServicosApp({
                    apiUrl,
                    fetchImpl: jest.fn()
                })
            ).toThrow(
                'A URL da API precisa utilizar HTTPS.'
            )
        }
    )

    test('permite HTTP somente quando o modo de desenvolvimento é solicitado', () => {
        criarServicosApp({
            apiUrl: 'http://10.0.2.2:3000/',
            fetchImpl: jest.fn(),
            permitirHttpDesenvolvimento: true
        })

        expect(criarApiClient).toHaveBeenCalledWith({
            baseUrl: 'http://10.0.2.2:3000',
            fetchImpl: expect.any(Function)
        })
    })

    test('repassa as opções e adiciona o sinal de cancelamento', async () => {
        jest.useFakeTimers()

        const resposta = {
            ok: true
        }

        const fetchImpl =
            jest.fn().mockResolvedValue(resposta)

        criarServicosApp({
            apiUrl: 'https://api.aloya.com',
            fetchImpl
        })

        const opcoes = {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        }

        await expect(
            fetchSeguro(
                'https://api.aloya.com/users/me',
                opcoes
            )
        ).resolves.toBe(resposta)

        expect(fetchImpl).toHaveBeenCalledWith(
            'https://api.aloya.com/users/me',
            {
                ...opcoes,
                signal: expect.anything()
            }
        )

        expect(opcoes).toEqual({
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        })

        expect(jest.getTimerCount()).toBe(0)
    })

    test('cancela uma requisição que ultrapassa o tempo limite', async () => {
        jest.useFakeTimers()

        const fetchImpl = jest.fn(
            (url, {signal}) => new Promise(
                (resolver, rejeitar) => {
                    signal.addEventListener(
                        'abort',
                        () => {
                            const erro =
                                new Error('Abortado')

                            erro.name = 'AbortError'
                            rejeitar(erro)
                        }
                    )
                }
            )
        )

        criarServicosApp({
            apiUrl: 'https://api.aloya.com',
            fetchImpl
        })

        const resultado = expect(
            fetchSeguro(
                'https://api.aloya.com/users/me'
            )
        ).rejects.toMatchObject({
            message:
                'A conexão demorou demais. Tente novamente.',
            mensagemUsuario:
                'A conexão demorou demais. Tente novamente.'
        })

        jest.advanceTimersByTime(15000)

        await resultado

        expect(jest.getTimerCount()).toBe(0)
    })

    test('converte erros internos em uma mensagem segura de conexão', async () => {
        const fetchImpl =
            jest.fn().mockRejectedValue(
                new Error(
                    'Detalhe interno da conexão'
                )
            )

        criarServicosApp({
            apiUrl: 'https://api.aloya.com',
            fetchImpl
        })

        await expect(
            fetchSeguro(
                'https://api.aloya.com/users/me'
            )
        ).rejects.toMatchObject({
            message:
                'Não foi possível conectar ao servidor. Verifique sua conexão.',
            mensagemUsuario:
                'Não foi possível conectar ao servidor. Verifique sua conexão.'
        })
    })
})
