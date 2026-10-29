import {endpoints} from '../../../../src/shared/services/api/endpoints'
import {
    MENSAGEM_ERRO_TEMA,
    criarThemePreferenceService,
    extrairPreferenciaTema
} from '../../../../src/features/settings/services/themePreferenceService'

function criarResposta(
    temaVisual = 'automatico'
) {
    return {
        configuracoes: {
            id: 1,
            temaVisual
        }
    }
}

describe('themePreferenceService', () => {
    test('rejeita configuração sem requisição autenticada', () => {
        expect(
            () =>
                criarThemePreferenceService()
        ).toThrow(
            'Não foi possível configurar o serviço de preferência visual.'
        )

        expect(
            () =>
                criarThemePreferenceService({
                    requisicaoAutenticada:
                        null
                })
        ).toThrow(
            'Não foi possível configurar o serviço de preferência visual.'
        )
    })

    test.each([
        'claro',
        'escuro',
        'automatico'
    ])(
        'extrai a preferência válida %s',
        (temaVisual) => {
            expect(
                extrairPreferenciaTema(
                    criarResposta(
                        temaVisual
                    )
                )
            ).toBe(temaVisual)
        }
    )

    test.each([
        null,
        undefined,
        {},
        {
            configuracoes: null
        },
        criarResposta('dark'),
        criarResposta(' ESCURO ')
    ])(
        'rejeita uma resposta inválida da API: %p',
        (resposta) => {
            expect(
                () =>
                    extrairPreferenciaTema(
                        resposta
                    )
            ).toThrow(
                'Não foi possível carregar sua preferência de tema.'
            )
        }
    )

    test('busca a preferência da conta autenticada', async () => {
        const requisicaoAutenticada =
            jest.fn().mockResolvedValue(
                criarResposta('escuro')
            )

        const service =
            criarThemePreferenceService({
                requisicaoAutenticada
            })

        await expect(
            service.buscarPreferencia()
        ).resolves.toBe('escuro')

        expect(
            requisicaoAutenticada
        ).toHaveBeenCalledWith({
            caminho:
                endpoints.configuracoesConta
        })
    })

    test('encaminha o sinal de cancelamento na busca', async () => {
        const requisicaoAutenticada =
            jest.fn().mockResolvedValue(
                criarResposta()
            )

        const service =
            criarThemePreferenceService({
                requisicaoAutenticada
            })

        const controlador =
            new AbortController()

        await service.buscarPreferencia({
            signal: controlador.signal
        })

        expect(
            requisicaoAutenticada
        ).toHaveBeenCalledWith({
            caminho:
                endpoints.configuracoesConta,
            signal: controlador.signal
        })
    })

    test('atualiza somente a preferência validada', async () => {
        const requisicaoAutenticada =
            jest.fn().mockResolvedValue(
                criarResposta('escuro')
            )

        const service =
            criarThemePreferenceService({
                requisicaoAutenticada
            })

        await expect(
            service.atualizarPreferencia(
                'escuro'
            )
        ).resolves.toBe('escuro')

        expect(
            requisicaoAutenticada
        ).toHaveBeenCalledWith({
            metodo: 'PATCH',
            caminho:
                endpoints.configuracoesConta,
            corpo: {
                temaVisual: 'escuro'
            }
        })
    })

    test.each([
        null,
        undefined,
        '',
        'dark',
        'Escuro',
        1,
        {}
    ])(
        'rejeita preferência inválida antes da API: %p',
        async (preferencia) => {
            const requisicaoAutenticada =
                jest.fn()

            const service =
                criarThemePreferenceService({
                    requisicaoAutenticada
                })

            await expect(
                service.atualizarPreferencia(
                    preferencia
                )
            ).rejects.toMatchObject({
                codigo:
                    'PREFERENCIA_TEMA_INVALIDA'
            })

            expect(
                requisicaoAutenticada
            ).not.toHaveBeenCalled()
        }
    )

    test('reutiliza a mesma alteração em andamento', async () => {
        let concluir

        const requisicaoAutenticada =
            jest.fn().mockImplementation(
                () =>
                    new Promise(
                        (resolver) => {
                            concluir =
                                resolver
                        }
                    )
            )

        const service =
            criarThemePreferenceService({
                requisicaoAutenticada
            })

        const primeira =
            service.atualizarPreferencia(
                'escuro'
            )

        const segunda =
            service.atualizarPreferencia(
                'escuro'
            )

        expect(segunda).toBe(primeira)

        expect(
            requisicaoAutenticada
        ).toHaveBeenCalledTimes(1)

        concluir(
            criarResposta('escuro')
        )

        await primeira
    })

    test('impede preferências concorrentes diferentes', async () => {
        let concluir

        const requisicaoAutenticada =
            jest.fn().mockImplementation(
                () =>
                    new Promise(
                        (resolver) => {
                            concluir =
                                resolver
                        }
                    )
            )

        const service =
            criarThemePreferenceService({
                requisicaoAutenticada
            })

        const primeira =
            service.atualizarPreferencia(
                'escuro'
            )

        await expect(
            service.atualizarPreferencia(
                'claro'
            )
        ).rejects.toMatchObject({
            codigo:
                'ALTERACAO_TEMA_EM_ANDAMENTO'
        })

        concluir(
            criarResposta('escuro')
        )

        await primeira
    })

    test('rejeita resposta diferente da preferência enviada', async () => {
        const requisicaoAutenticada =
            jest.fn().mockResolvedValue(
                criarResposta('claro')
            )

        const service =
            criarThemePreferenceService({
                requisicaoAutenticada
            })

        await expect(
            service.atualizarPreferencia(
                'escuro'
            )
        ).rejects.toMatchObject({
            codigo:
                'TEMA_NAO_CONFIRMADO',
            mensagemUsuario:
                MENSAGEM_ERRO_TEMA
        })
    })

    test('adiciona mensagem segura em falha inesperada', async () => {
        const erro =
            new Error(
                'detalhe interno'
            )

        const requisicaoAutenticada =
            jest.fn().mockRejectedValue(
                erro
            )

        const service =
            criarThemePreferenceService({
                requisicaoAutenticada
            })

        await expect(
            service.atualizarPreferencia(
                'automatico'
            )
        ).rejects.toMatchObject({
            mensagemUsuario:
                MENSAGEM_ERRO_TEMA
        })
    })

    test('permite nova alteração após a anterior terminar', async () => {
        const requisicaoAutenticada =
            jest.fn()
                .mockResolvedValueOnce(
                    criarResposta('escuro')
                )
                .mockResolvedValueOnce(
                    criarResposta('claro')
                )

        const service =
            criarThemePreferenceService({
                requisicaoAutenticada
            })

        await service.atualizarPreferencia(
            'escuro'
        )

        await expect(
            service.atualizarPreferencia(
                'claro'
            )
        ).resolves.toBe('claro')

        expect(
            requisicaoAutenticada
        ).toHaveBeenCalledTimes(2)
    })

    test('retorna uma interface protegida contra alterações', () => {
        const service =
            criarThemePreferenceService({
                requisicaoAutenticada:
                    jest.fn()
            })

        expect(
            Object.isFrozen(service)
        ).toBe(true)
    })
})