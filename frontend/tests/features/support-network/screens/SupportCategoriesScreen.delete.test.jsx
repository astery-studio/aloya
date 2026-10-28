// Testa a integração da exclusão com a listagem de categorias.
import {
    act,
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

const mockUseSupportCategories =
    jest.fn()

const mockUseDeleteSupportCategory =
    jest.fn()

let mockListaProps
let mockModalExclusaoProps

const mockCategoria = Object.freeze({
    id: 7,
    nome: 'Família',
    dadosVisiveis: Object.freeze([
        'geral.fase_atual'
    ]),
    quantidadeContatos: 2,
    criadoEm:
        '2026-10-20T10:00:00.000Z',
    atualizadoEm:
        '2026-10-26T12:00:00.000Z'
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

jest.mock(
    '../../../../src/features/support-network/hooks/useSupportCategories',
    () => ({
        useSupportCategories:
            configuracao =>
                mockUseSupportCategories(
                    configuracao
                )
    })
)

jest.mock(
    '../../../../src/features/support-network/hooks/useDeleteSupportCategory',
    () => ({
        useDeleteSupportCategory:
            configuracao =>
                mockUseDeleteSupportCategory(
                    configuracao
                )
    })
)

jest.mock(
    '../../../../src/shared/components/navigation/Header/Header',
    () => {
        const React = require('react')
        const {Text} =
            require('react-native')

        return {
            Header: ({titulo}) =>
                React.createElement(
                    Text,
                    null,
                    titulo
                )
        }
    }
)

jest.mock(
    '../../../../src/features/support-network/components/SupportCategoryList',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        return {
            SupportCategoryList:
                propriedades => {
                    mockListaProps =
                        propriedades

                    return React.createElement(
                        View,
                        {
                            testID:
                                'lista-categorias'
                        },
                        React.createElement(
                            Text,
                            null,
                            propriedades
                                .categorias[0]
                                ?.nome
                                || 'Lista vazia'
                        ),
                        React.createElement(
                            Pressable,
                            {
                                accessibilityRole:
                                    'button',
                                accessibilityLabel:
                                    'Excluir categoria de teste',
                                onPress: () =>
                                    propriedades
                                        .onExcluir(
                                            mockCategoria
                                        )
                            }
                        )
                    )
                }
        }
    }
)

jest.mock(
    '../../../../src/features/support-network/components/DeleteSupportCategoryModal',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        return {
            DeleteSupportCategoryModal:
                propriedades => {
                    mockModalExclusaoProps =
                        propriedades

                    if (
                        !propriedades
                            .visivel
                    ) {
                        return null
                    }

                    return React.createElement(
                        View,
                        {
                            testID:
                                'modal-exclusao'
                        },
                        React.createElement(
                            Text,
                            null,
                            `Excluindo ${propriedades.categoria?.nome}`
                        ),
                        React.createElement(
                            Pressable,
                            {
                                accessibilityRole:
                                    'button',
                                accessibilityLabel:
                                    'Confirmar exclusão simulada',
                                onPress: () =>
                                    propriedades
                                        .onConfirmar(
                                            []
                                        )
                            }
                        ),
                        React.createElement(
                            Pressable,
                            {
                                accessibilityRole:
                                    'button',
                                accessibilityLabel:
                                    'Cancelar exclusão simulada',
                                onPress:
                                    propriedades
                                        .onCancelar
                            }
                        )
                    )
                }
        }
    }
)

jest.mock(
    '../../../../src/shared/components/feedback/Modal/SimpleModal',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        return function SimpleModal({
            visivel,
            titulo,
            mensagem,
            acaoPrincipal,
            acaoSecundaria
        }) {
            if (!visivel) {
                return null
            }

            return React.createElement(
                View,
                {
                    testID:
                        `modal-${titulo}`
                },
                React.createElement(
                    Text,
                    null,
                    titulo
                ),
                mensagem
                    ? React.createElement(
                        Text,
                        null,
                        mensagem
                    )
                    : null,
                acaoPrincipal
                    ? React.createElement(
                        Pressable,
                        {
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                acaoPrincipal
                                    .texto,
                            onPress:
                                acaoPrincipal
                                    .aoPressionar
                        }
                    )
                    : null,
                acaoSecundaria
                    ? React.createElement(
                        Pressable,
                        {
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                acaoSecundaria
                                    .texto,
                            onPress:
                                acaoSecundaria
                                    .aoPressionar
                        }
                    )
                    : null
            )
        }
    }
)

jest.mock(
    '../../../../src/features/support-network/screens/EditSupportCategoryScreen',
    () => ({
        EditSupportCategoryScreen:
            () => null
    })
)

import {
    SupportCategoriesScreen
} from '../../../../src/features/support-network/screens/SupportCategoriesScreen'

function criarEstadoCategorias(
    alteracoes = {}
) {
    return {
        categorias: [
            mockCategoria
        ],
        carregando: false,
        atualizando: false,
        erro: null,
        tentarNovamente:
            jest.fn(),
        atualizarCategoria:
            jest.fn(),
        removerCategoria:
            jest.fn(),
        ...alteracoes
    }
}

function criarEstadoExclusao(
    alteracoes = {}
) {
    return {
        categoria: null,
        impacto: null,
        decisoes: {},
        carregandoImpacto: false,
        excluindo: false,
        erro: null,
        sucesso: false,
        modalVisivel: false,
        solicitarExclusao:
            jest.fn(),
        alterarDecisao:
            jest.fn(),
        aplicarATodos:
            jest.fn(),
        confirmarExclusao:
            jest.fn(),
        cancelar:
            jest.fn(),
        tentarNovamente:
            jest.fn(),
        fecharErro:
            jest.fn(),
        concluirSucesso:
            jest.fn(),
        ...alteracoes
    }
}

describe(
    'SupportCategoriesScreen exclusão integrada',
    () => {
        beforeEach(() => {
            mockListaProps = null
            mockModalExclusaoProps =
                null

            mockUseSupportCategories
                .mockReset()

            mockUseDeleteSupportCategory
                .mockReset()

            mockUseSupportCategories
                .mockReturnValue(
                    criarEstadoCategorias()
                )

            mockUseDeleteSupportCategory
                .mockReturnValue(
                    criarEstadoExclusao()
                )
        })

        test(
            'conecta o serviço ao hook de exclusão',
            async () => {
                const service = {
                    listarCategorias:
                        jest.fn(),
                    consultarImpactoExclusao:
                        jest.fn(),
                    excluirCategoria:
                        jest.fn()
                }

                const onSessaoExpirada =
                    jest.fn()

                await render(
                    <SupportCategoriesScreen
                        service={service}
                        onSessaoExpirada={
                            onSessaoExpirada
                        }
                    />
                )

                expect(
                    mockUseDeleteSupportCategory
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        service,
                        onSessaoExpirada,
                        onCategoriaExcluida:
                            expect.any(
                                Function
                            )
                    })
                )
            }
        )

        test(
            'consulta o impacto ao selecionar excluir',
            async () => {
                const solicitarExclusao =
                    jest.fn()

                mockUseDeleteSupportCategory
                    .mockReturnValue(
                        criarEstadoExclusao({
                            solicitarExclusao
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn(),
                            consultarImpactoExclusao:
                                jest.fn(),
                            excluirCategoria:
                                jest.fn()
                        }}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Excluir categoria de teste'
                        }
                    )
                )

                expect(
                    solicitarExclusao
                ).toHaveBeenCalledWith(
                    mockCategoria
                )
            }
        )

        test(
            'apresenta o impacto e as decisões no modal',
            async () => {
                const decisoes = {
                    20: null,
                    21:
                        'remover_acesso'
                }

                mockUseDeleteSupportCategory
                    .mockReturnValue(
                        criarEstadoExclusao({
                            categoria:
                                mockCategoria,
                            impacto,
                            decisoes,
                            modalVisivel:
                                true
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn(),
                            consultarImpactoExclusao:
                                jest.fn(),
                            excluirCategoria:
                                jest.fn()
                        }}
                    />
                )

                expect(
                    screen.getByTestId(
                        'modal-exclusao'
                    )
                ).toBeOnTheScreen()

                expect(
                    mockModalExclusaoProps
                        .categoria
                ).toBe(mockCategoria)

                expect(
                    mockModalExclusaoProps
                        .contatos
                ).toEqual(
                    impacto.contatos
                )

                expect(
                    mockModalExclusaoProps
                        .decisoes
                ).toBe(decisoes)
            }
        )

        test(
            'remove a categoria da lista após a exclusão',
            async () => {
                const removerCategoria =
                    jest.fn()

                mockUseSupportCategories
                    .mockReturnValue(
                        criarEstadoCategorias({
                            removerCategoria
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn(),
                            consultarImpactoExclusao:
                                jest.fn(),
                            excluirCategoria:
                                jest.fn()
                        }}
                    />
                )

                const configuracaoHook =
                    mockUseDeleteSupportCategory
                        .mock.calls[0][0]

                await act(async () => {
                    configuracaoHook
                        .onCategoriaExcluida(
                            7
                        )
                })

                expect(
                    removerCategoria
                ).toHaveBeenCalledWith(7)
            }
        )

        test(
            'mostra a confirmação de sucesso',
            async () => {
                const concluirSucesso =
                    jest.fn()

                mockUseDeleteSupportCategory
                    .mockReturnValue(
                        criarEstadoExclusao({
                            sucesso: true,
                            concluirSucesso
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn(),
                            consultarImpactoExclusao:
                                jest.fn(),
                            excluirCategoria:
                                jest.fn()
                        }}
                    />
                )

                expect(
                    screen.getByText(
                        'Categoria excluída com sucesso.'
                    )
                ).toBeOnTheScreen()

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name: 'OK'
                        }
                    )
                )

                expect(
                    concluirSucesso
                ).toHaveBeenCalledTimes(1)
            }
        )

        test(
            'repete a exclusão sem perder as decisões',
            async () => {
                const confirmarExclusao =
                    jest.fn()

                mockUseDeleteSupportCategory
                    .mockReturnValue(
                        criarEstadoExclusao({
                            categoria:
                                mockCategoria,
                            impacto,
                            decisoes: {
                                20:
                                    'remover_acesso',
                                21:
                                    'manter_acesso_individual'
                            },
                            erro: {
                                codigo:
                                    'ERRO_EXCLUSAO_CATEGORIA',
                                mensagem:
                                    'Ocorreu um erro ao deletar. Verifique sua conexão e tente novamente.'
                            },
                            confirmarExclusao
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn(),
                            consultarImpactoExclusao:
                                jest.fn(),
                            excluirCategoria:
                                jest.fn()
                        }}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Tentar novamente'
                        }
                    )
                )

                expect(
                    confirmarExclusao
                ).toHaveBeenCalledWith([
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
            }
        )

        test(
            'mantém o encaminhamento antigo sem serviço de exclusão',
            async () => {
                const onExcluir =
                    jest.fn()

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn()
                        }}
                        onExcluir={onExcluir}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Excluir categoria de teste'
                        }
                    )
                )

                expect(
                    onExcluir
                ).toHaveBeenCalledWith(
                    mockCategoria
                )
            }
        )
    }
)