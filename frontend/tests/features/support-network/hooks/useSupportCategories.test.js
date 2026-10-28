//Testa carregamento, atualização, cancelamento e alterações locais das categorias.
import {
    act,
    renderHook,
    waitFor
} from '@testing-library/react-native'

import {
    ordenarCategorias,
    useSupportCategories
} from '../../../../src/features/support-network/hooks/useSupportCategories'

function criarCategoria({
    id = 1,
    nome = 'Família',
    quantidadeContatos = 0,
    dadosVisiveis = [
        'geral.fase_atual'
    ],
    criadoEm =
        '2026-09-25T10:00:00.000Z',
    atualizadoEm =
        '2026-09-25T10:00:00.000Z'
} = {}) {
    return {
        id,
        nome,
        dadosVisiveis,
        quantidadeContatos,
        criadoEm,
        atualizadoEm
    }
}

describe('useSupportCategories', () => {
    test('carrega automaticamente as categorias', async () => {
        const lista = [
            criarCategoria({
                id: 2,
                nome: 'Parceiro(a)'
            }),
            criarCategoria({
                id: 1,
                nome: 'Família'
            })
        ]

        const service = {
            listarCategorias:
                jest.fn()
                    .mockResolvedValue(
                        lista
                    )
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        expect(
            service.listarCategorias
        ).toHaveBeenCalledWith({
            signal:
                expect.any(AbortSignal)
        })

        expect(
            result.current.categorias
                .map(categoria =>
                    categoria.nome
                )
        ).toEqual([
            'Família',
            'Parceiro(a)'
        ])

        expect(
            result.current.erro
        ).toBeNull()

        expect(
            Object.isFrozen(
                result.current.categorias
            )
        ).toBe(true)
    })

    test('mantém o carregamento inicial enquanto a requisição está pendente', async () => {
        let concluirRequisicao

        const service = {
            listarCategorias:
                jest.fn(
                    () =>
                        new Promise(
                            resolve => {
                                concluirRequisicao =
                                    resolve
                            }
                        )
                )
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        expect(
            result.current.carregando
        ).toBe(true)

        await act(async () => {
            concluirRequisicao([])
            await Promise.resolve()
        })

        expect(
            result.current.carregando
        ).toBe(false)
    })

    test('aceita uma lista vazia', async () => {
        const service = {
            listarCategorias:
                jest.fn()
                    .mockResolvedValue([])
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        expect(
            result.current.categorias
        ).toEqual([])

        expect(
            result.current.erro
        ).toBeNull()
    })

    test('mostra erro genérico sem expor detalhes internos', async () => {
        const service = {
            listarCategorias:
                jest.fn()
                    .mockRejectedValue(
                        new Error(
                            'Falha privada do banco'
                        )
                    )
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        expect(
            result.current.erro
        ).toBe(
            'Não foi possível carregar suas categorias no momento. Tente novamente.'
        )

        expect(
            result.current.erro
        ).not.toContain('banco')
    })

    test('permite tentar novamente após falha', async () => {
        const categoria =
            criarCategoria()

        const service = {
            listarCategorias:
                jest.fn()
                    .mockRejectedValueOnce(
                        new Error(
                            'Falha temporária'
                        )
                    )
                    .mockResolvedValueOnce([
                        categoria
                    ])
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                result.current.erro
            ).not.toBeNull()
        })

        await act(async () => {
            await result.current
                .tentarNovamente()
        })

        expect(
            service.listarCategorias
        ).toHaveBeenCalledTimes(2)

        expect(
            result.current.erro
        ).toBeNull()

        expect(
            result.current.categorias
        ).toEqual([categoria])
    })

    test('mantém as categorias visíveis durante atualização', async () => {
        let concluirAtualizacao
        let promessaAtualizacao

        const categoriaInicial =
            criarCategoria({
                nome: 'Família'
            })

        const categoriaAtualizada =
            criarCategoria({
                nome:
                    'Família próxima'
            })

        const service = {
            listarCategorias:
                jest.fn()
                    .mockResolvedValueOnce([
                        categoriaInicial
                    ])
                    .mockImplementationOnce(
                        () =>
                            new Promise(
                                resolve => {
                                    concluirAtualizacao =
                                        resolve
                                }
                            )
                    )
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        await act(async () => {
            promessaAtualizacao =
                result.current
                    .atualizarLista()

            await Promise.resolve()
        })

        expect(
            result.current.atualizando
        ).toBe(true)

        expect(
            result.current.categorias
        ).toEqual([
            categoriaInicial
        ])

        await act(async () => {
            concluirAtualizacao([
                categoriaAtualizada
            ])

            await promessaAtualizacao
        })

        expect(
            result.current.atualizando
        ).toBe(false)

        expect(
            result.current.categorias
        ).toEqual([
            categoriaAtualizada
        ])
    })

    test('mantém os dados quando uma atualização falha', async () => {
        const categoria =
            criarCategoria()

        const service = {
            listarCategorias:
                jest.fn()
                    .mockResolvedValueOnce([
                        categoria
                    ])
                    .mockRejectedValueOnce(
                        new Error(
                            'Falha de rede'
                        )
                    )
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        await act(async () => {
            await result.current
                .atualizarLista()
        })

        expect(
            result.current.categorias
        ).toEqual([categoria])

        expect(
            result.current.erro
        ).toBe(
            'Não foi possível carregar suas categorias no momento. Tente novamente.'
        )

        expect(
            result.current.atualizando
        ).toBe(false)
    })

    test('impede duas listagens simultâneas', async () => {
        let concluirRequisicao

        const service = {
            listarCategorias:
                jest.fn(
                    () =>
                        new Promise(
                            resolve => {
                                concluirRequisicao =
                                    resolve
                            }
                        )
                )
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        let segundaRequisicao

        await act(async () => {
            segundaRequisicao =
                await result.current
                    .atualizarLista()
        })

        expect(
            segundaRequisicao
        ).toBe(false)

        expect(
            service.listarCategorias
        ).toHaveBeenCalledTimes(1)

        await act(async () => {
            concluirRequisicao([])
            await Promise.resolve()
        })

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })
    })

    test('encerra a sessão quando a API devolve erro de autenticação', async () => {
        const falha = new Error(
            'Informação privada'
        )

        falha.status = 401
        falha.codigo =
            'TOKEN_INVALIDO'

        const onSessaoExpirada =
            jest.fn()

        const service = {
            listarCategorias:
                jest.fn()
                    .mockRejectedValue(
                        falha
                    )
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service,
                    onSessaoExpirada
                })
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        expect(
            onSessaoExpirada
        ).toHaveBeenCalledWith({
            mensagem:
                'Sua sessão expirou. Entre novamente.'
        })

        expect(
            result.current.erro
        ).toBeNull()

        expect(
            result.current.categorias
        ).toEqual([])
    })

    test.each([
        'NAO_AUTENTICADO',
        'SESSAO_INVALIDA',
        'SESSAO_AUSENTE'
    ])(
        'encerra a sessão para o código %s',
        async codigo => {
            const falha =
                new Error(
                    'Sessão inválida'
                )

            falha.codigo = codigo

            const onSessaoExpirada =
                jest.fn()

            const service = {
                listarCategorias:
                    jest.fn()
                        .mockRejectedValue(
                            falha
                        )
            }

            const {result} =
                await renderHook(() =>
                    useSupportCategories({
                        service,
                        onSessaoExpirada
                    })
                )

            await waitFor(() => {
                expect(
                    result.current
                        .carregando
                ).toBe(false)
            })

            expect(
                onSessaoExpirada
            ).toHaveBeenCalledTimes(1)

            expect(
                result.current.erro
            ).toBeNull()
        }
    )

    test('cancela a requisição ao desmontar', async () => {
        let sinalRecebido

        const service = {
            listarCategorias:
                jest.fn(
                    ({signal}) => {
                        sinalRecebido =
                            signal

                        return new Promise(
                            () => {}
                        )
                    }
                )
        }

        const {unmount} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                sinalRecebido
            ).toBeDefined()
        })

        expect(
            sinalRecebido.aborted
        ).toBe(false)

        await act(async () => {
            unmount()
        })

        expect(
            sinalRecebido.aborted
        ).toBe(true)
    })

    test('mostra erro quando não recebe um serviço válido', async () => {
        const {result} =
            await renderHook(() =>
                useSupportCategories()
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        expect(
            result.current.categorias
        ).toEqual([])

        expect(
            result.current.erro
        ).toBe(
            'Não foi possível carregar suas categorias no momento. Tente novamente.'
        )
    })

    test('adiciona uma categoria e preserva a ordenação', async () => {
        const categoriaParceiro =
            criarCategoria({
                id: 2,
                nome: 'Parceiro(a)'
            })

        const categoriaFamilia =
            criarCategoria({
                id: 1,
                nome: 'Família'
            })

        const service = {
            listarCategorias:
                jest.fn()
                    .mockResolvedValue([
                        categoriaParceiro
                    ])
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        act(() => {
            result.current
                .adicionarCategoria(
                    categoriaFamilia
                )
        })

        expect(
            result.current.categorias
                .map(categoria =>
                    categoria.nome
                )
        ).toEqual([
            'Família',
            'Parceiro(a)'
        ])
    })

    test('substitui uma categoria atualizada sem duplicar o item', async () => {
        const categoriaInicial =
            criarCategoria({
                id: 1,
                nome: 'Família'
            })

        const categoriaAtualizada =
            criarCategoria({
                id: 1,
                nome: 'Rede próxima',
                quantidadeContatos: 2,
                atualizadoEm:
                    '2026-09-25T11:00:00.000Z'
            })

        const service = {
            listarCategorias:
                jest.fn()
                    .mockResolvedValue([
                        categoriaInicial
                    ])
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        act(() => {
            result.current
                .atualizarCategoria(
                    categoriaAtualizada
                )
        })

        expect(
            result.current.categorias
        ).toEqual([
            categoriaAtualizada
        ])

        expect(
            result.current.categorias
        ).toHaveLength(1)
    })

    test('remove uma categoria pelo identificador', async () => {
        const primeiraCategoria =
            criarCategoria({
                id: 1,
                nome: 'Família'
            })

        const segundaCategoria =
            criarCategoria({
                id: 2,
                nome: 'Parceiro(a)'
            })

        const service = {
            listarCategorias:
                jest.fn()
                    .mockResolvedValue([
                        primeiraCategoria,
                        segundaCategoria
                    ])
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        act(() => {
            result.current
                .removerCategoria(1)
        })

        expect(
            result.current.categorias
        ).toEqual([
            segundaCategoria
        ])
    })

    test('ignora a remoção de um identificador inválido', async () => {
        const categoria =
            criarCategoria()

        const service = {
            listarCategorias:
                jest.fn()
                    .mockResolvedValue([
                        categoria
                    ])
        }

        const {result} =
            await renderHook(() =>
                useSupportCategories({
                    service
                })
            )

        await waitFor(() => {
            expect(
                result.current.carregando
            ).toBe(false)
        })

        let removeu

        act(() => {
            removeu =
                result.current
                    .removerCategoria(-1)
        })

        expect(removeu).toBe(false)

        expect(
            result.current.categorias
        ).toEqual([categoria])
    })

    test('ordena nomes sem diferenciar maiúsculas e acentos', () => {
        const resultado =
            ordenarCategorias([
                criarCategoria({
                    id: 3,
                    nome: 'Rede próxima'
                }),
                criarCategoria({
                    id: 2,
                    nome: 'parceiro'
                }),
                criarCategoria({
                    id: 1,
                    nome: 'Família'
                })
            ])

        expect(
            resultado.map(
                categoria =>
                    categoria.nome
            )
        ).toEqual([
            'Família',
            'parceiro',
            'Rede próxima'
        ])
    })
})