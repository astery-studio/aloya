//Testa carregamento, decisões, exclusão e recuperação do fluxo.
import {
    act,
    renderHook,
    waitFor
} from '@testing-library/react-native'

import {
    useDeleteSupportCategory
} from '../../../../src/features/support-network/hooks/useDeleteSupportCategory'

const categoria = Object.freeze({
    id: 7,
    nome: 'Família'
})

const impacto = Object.freeze({
    categoria: Object.freeze({
        id: 7,
        nome: 'Família',
        atualizadoEm:
            '2026-10-26T12:00:00.000Z'
    }),
    quantidadeContatos: 2,
    contatos: Object.freeze([
        Object.freeze({
            vinculoId: 20,
            nome: 'Ana'
        }),
        Object.freeze({
            vinculoId: 21,
            nome: 'Carlos'
        })
    ])
})

describe(
    'useDeleteSupportCategory',
    () => {
        test(
            'consulta o impacto ao solicitar a exclusão',
            async () => {
                const service = {
                    consultarImpactoExclusao:
                        jest.fn()
                            .mockResolvedValue(
                                impacto
                            )
                }

                const {result} =
                    renderHook(() =>
                        useDeleteSupportCategory({
                            service
                        })
                    )

                await act(async () => {
                    await result.current
                        .solicitarExclusao(
                            categoria
                        )
                })

                expect(
                    service
                        .consultarImpactoExclusao
                ).toHaveBeenCalledWith(
                    7,
                    {
                        signal:
                            expect.any(
                                AbortSignal
                            )
                    }
                )

                expect(
                    result.current.impacto
                ).toEqual(impacto)

                expect(
                    result.current.decisoes
                ).toEqual({
                    20: null,
                    21: null
                })

                expect(
                    result.current
                        .modalVisivel
                ).toBe(true)
            }
        )

        test(
            'altera somente a decisão selecionada',
            async () => {
                const {result} =
                    renderHook(() =>
                        useDeleteSupportCategory({
                            service: {
                                consultarImpactoExclusao:
                                    jest.fn()
                                        .mockResolvedValue(
                                            impacto
                                        )
                            }
                        })
                    )

                await act(async () => {
                    await result.current
                        .solicitarExclusao(
                            categoria
                        )
                })

                act(() => {
                    result.current
                        .alterarDecisao(
                            20,
                            'remover_acesso'
                        )
                })

                expect(
                    result.current.decisoes
                ).toEqual({
                    20:
                        'remover_acesso',
                    21: null
                })
            }
        )

        test(
            'aplica uma decisão a todos',
            async () => {
                const {result} =
                    renderHook(() =>
                        useDeleteSupportCategory({
                            service: {
                                consultarImpactoExclusao:
                                    jest.fn()
                                        .mockResolvedValue(
                                            impacto
                                        )
                            }
                        })
                    )

                await act(async () => {
                    await result.current
                        .solicitarExclusao(
                            categoria
                        )
                })

                act(() => {
                    result.current
                        .aplicarATodos(
                            'manter_acesso_individual'
                        )
                })

                expect(
                    result.current.decisoes
                ).toEqual({
                    20:
                        'manter_acesso_individual',
                    21:
                        'manter_acesso_individual'
                })
            }
        )

        test(
            'não exclui enquanto faltam decisões',
            async () => {
                const excluirCategoria =
                    jest.fn()

                const {result} =
                    renderHook(() =>
                        useDeleteSupportCategory({
                            service: {
                                consultarImpactoExclusao:
                                    jest.fn()
                                        .mockResolvedValue(
                                            impacto
                                        ),
                                excluirCategoria
                            }
                        })
                    )

                await act(async () => {
                    await result.current
                        .solicitarExclusao(
                            categoria
                        )
                })

                await act(async () => {
                    await result.current
                        .confirmarExclusao([
                            {
                                vinculoId: 20,
                                acao:
                                    'remover_acesso'
                            }
                        ])
                })

                expect(
                    excluirCategoria
                ).not.toHaveBeenCalled()
            }
        )

        test(
            'exclui com a versão e as decisões completas',
            async () => {
                const excluirCategoria =
                    jest.fn()
                        .mockResolvedValue({
                            categoriaId: 7,
                            quantidadeAcessosRemovidos:
                                1,
                            quantidadeAcessosMantidos:
                                1
                        })

                const onCategoriaExcluida =
                    jest.fn()

                const {result} =
                    renderHook(() =>
                        useDeleteSupportCategory({
                            service: {
                                consultarImpactoExclusao:
                                    jest.fn()
                                        .mockResolvedValue(
                                            impacto
                                        ),
                                excluirCategoria
                            },
                            onCategoriaExcluida
                        })
                    )

                await act(async () => {
                    await result.current
                        .solicitarExclusao(
                            categoria
                        )
                })

                await act(async () => {
                    await result.current
                        .confirmarExclusao([
                            {
                                vinculoId: 20,
                                acao:
                                    'remover_acesso'
                            },
                            {
                                vinculoId: 21,
                                acao:
                                    'manter_acesso_individual'
                            }
                        ])
                })

                expect(
                    excluirCategoria
                ).toHaveBeenCalledWith(
                    7,
                    {
                        atualizadoEm:
                            '2026-10-26T12:00:00.000Z',
                        decisoes: [
                            {
                                vinculoId: 20,
                                acao:
                                    'remover_acesso'
                            },
                            {
                                vinculoId: 21,
                                acao:
                                    'manter_acesso_individual'
                            }
                        ]
                    }
                )

                expect(
                    onCategoriaExcluida
                ).toHaveBeenCalledWith(7)

                expect(
                    result.current.sucesso
                ).toBe(true)
            }
        )

        test(
            'permite excluir uma categoria sem contatos',
            async () => {
                const excluirCategoria =
                    jest.fn()
                        .mockResolvedValue({
                            categoriaId: 7,
                            quantidadeAcessosRemovidos:
                                0,
                            quantidadeAcessosMantidos:
                                0
                        })

                const impactoVazio = {
                    ...impacto,
                    quantidadeContatos: 0,
                    contatos: []
                }

                const {result} =
                    renderHook(() =>
                        useDeleteSupportCategory({
                            service: {
                                consultarImpactoExclusao:
                                    jest.fn()
                                        .mockResolvedValue(
                                            impactoVazio
                                        ),
                                excluirCategoria
                            }
                        })
                    )

                await act(async () => {
                    await result.current
                        .solicitarExclusao(
                            categoria
                        )
                })

                await act(async () => {
                    await result.current
                        .confirmarExclusao([])
                })

                expect(
                    excluirCategoria
                ).toHaveBeenCalledWith(
                    7,
                    {
                        atualizadoEm:
                            '2026-10-26T12:00:00.000Z',
                        decisoes: []
                    }
                )
            }
        )

        test(
            'mantém o fluxo aberto quando a exclusão falha',
            async () => {
                const {result} =
                    renderHook(() =>
                        useDeleteSupportCategory({
                            service: {
                                consultarImpactoExclusao:
                                    jest.fn()
                                        .mockResolvedValue(
                                            impacto
                                        ),
                                excluirCategoria:
                                    jest.fn()
                                        .mockRejectedValue(
                                            new Error(
                                                'Erro privado'
                                            )
                                        )
                            }
                        })
                    )

                await act(async () => {
                    await result.current
                        .solicitarExclusao(
                            categoria
                        )
                })

                await act(async () => {
                    await result.current
                        .confirmarExclusao([
                            {
                                vinculoId: 20,
                                acao:
                                    'remover_acesso'
                            },
                            {
                                vinculoId: 21,
                                acao:
                                    'remover_acesso'
                            }
                        ])
                })

                expect(
                    result.current.erro
                        .mensagem
                ).toBe(
                    'Ocorreu um erro ao deletar. Verifique sua conexão e tente novamente.'
                )

                expect(
                    result.current.impacto
                ).toEqual(impacto)
            }
        )

        test(
            'solicita nova consulta quando o impacto mudou',
            async () => {
                const erro =
                    new Error(
                        'Detalhes privados'
                    )

                erro.codigo =
                    'IMPACTO_EXCLUSAO_ALTERADO'

                const {result} =
                    renderHook(() =>
                        useDeleteSupportCategory({
                            service: {
                                consultarImpactoExclusao:
                                    jest.fn()
                                        .mockResolvedValue(
                                            impacto
                                        ),
                                excluirCategoria:
                                    jest.fn()
                                        .mockRejectedValue(
                                            erro
                                        )
                            }
                        })
                    )

                await act(async () => {
                    await result.current
                        .solicitarExclusao(
                            categoria
                        )
                })

                await act(async () => {
                    await result.current
                        .confirmarExclusao([
                            {
                                vinculoId: 20,
                                acao:
                                    'remover_acesso'
                            },
                            {
                                vinculoId: 21,
                                acao:
                                    'remover_acesso'
                            }
                        ])
                })

                expect(
                    result.current.erro
                        .mensagem
                ).toBe(
                    'Os contatos vinculados à categoria foram alterados. Revise as escolhas e tente novamente.'
                )
            }
        )

        test(
            'cancela a consulta pendente ao desmontar',
            async () => {
                let sinalRecebido

                const service = {
                    consultarImpactoExclusao:
                        jest.fn((
                            _categoriaId,
                            {signal}
                        ) => {
                            sinalRecebido =
                                signal

                            return new Promise(
                                () => {}
                            )
                        })
                }

                const {result, unmount} =
                    renderHook(() =>
                        useDeleteSupportCategory({
                            service
                        })
                    )

                act(() => {
                    result.current
                        .solicitarExclusao(
                            categoria
                        )
                })

                await waitFor(() => {
                    expect(
                        sinalRecebido
                    ).toBeDefined()
                })

                unmount()

                expect(
                    sinalRecebido.aborted
                ).toBe(true)
            }
        )

        test(
            'encerra a sessão quando a API rejeita a autenticação',
            async () => {
                const erro =
                    new Error(
                        'Detalhes privados'
                    )

                erro.status = 401
                erro.codigo =
                    'SESSAO_INVALIDA'

                const onSessaoExpirada =
                    jest.fn()

                const {result} =
                    renderHook(() =>
                        useDeleteSupportCategory({
                            service: {
                                consultarImpactoExclusao:
                                    jest.fn()
                                        .mockRejectedValue(
                                            erro
                                        )
                            },
                            onSessaoExpirada
                        })
                    )

                await act(async () => {
                    await result.current
                        .solicitarExclusao(
                            categoria
                        )
                })

                expect(
                    onSessaoExpirada
                ).toHaveBeenCalledTimes(1)

                expect(
                    result.current.erro
                ).toBeNull()
            }
        )
    }
)