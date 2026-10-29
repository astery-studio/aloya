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
    test('carrega e ordena automaticamente as categorias', async () => {
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

        expect(
            result.current.categorias
        ).toEqual([])
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

    test('permite tentar novamente após uma falha', async () => {
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

    test('mantém os dados visíveis quando a atualização falha', async () => {
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

    test.each([
        {
            status: 401,
            codigo: 'TOKEN_INVALIDO'
        },
        {
            codigo:
                'NAO_AUTENTICADO'
        },
        {
            codigo:
                'SESSAO_INVALIDA'
        },
        {
            codigo:
                'SESSAO_AUSENTE'
        }
    ])(
        'encerra a sessão para o erro $codigo',
        async dadosErro => {
            const falha =
                new Error(
                    'Informação privada'
                )

            Object.assign(
                falha,
                dadosErro
            )

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

    test('mostra erro quando não recebe serviço válido', async () => {
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

        await act(async () => {
            result.current
                .adicionarCategoria(
                    categoriaFamilia
                )

            await Promise.resolve()
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

        await act(async () => {
            result.current
                .atualizarCategoria(
                    categoriaAtualizada
                )

            await Promise.resolve()
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

        await act(async () => {
            result.current
                .removerCategoria(1)

            await Promise.resolve()
        })

        expect(
            result.current.categorias
        ).toEqual([
            segundaCategoria
        ])
    })

    test('ignora a remoção de identificador inválido', async () => {
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

        await act(async () => {
            removeu =
                result.current
                    .removerCategoria(-1)

            await Promise.resolve()
        })

        expect(removeu).toBe(false)

        expect(
            result.current.categorias
        ).toEqual([categoria])
    })

    test('ordena nomes alfabeticamente em português', () => {
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