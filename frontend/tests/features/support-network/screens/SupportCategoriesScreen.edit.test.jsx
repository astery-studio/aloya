//Testa a navegação interna entre a lista e a edição de categorias.
import React from 'react'
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

const mockUseSupportCategories =
    jest.fn()

const categoria = Object.freeze({
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

const mockCategoriaAtualizada =
    Object.freeze({
        ...categoria,
        nome: 'Parceiro(a)',
        atualizadoEm:
            '2026-10-28T12:00:00.000Z'
    })

jest.mock(
    '../../../../src/features/support-network/hooks/useSupportCategories',
    () => ({
        useSupportCategories: configuracao =>
            mockUseSupportCategories(
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
            SupportCategoryList: ({
                categorias,
                onEditar
            }) =>
                React.createElement(
                    View,
                    {
                        testID:
                            'lista-categorias'
                    },
                    React.createElement(
                        Text,
                        null,
                        categorias[0]?.nome
                            || 'Lista vazia'
                    ),
                    categorias[0]
                        ? React.createElement(
                            Pressable,
                            {
                                accessibilityRole:
                                    'button',
                                accessibilityLabel:
                                    'Editar categoria de teste',
                                onPress: () =>
                                    onEditar(
                                        categorias[0]
                                    )
                            },
                            React.createElement(
                                Text,
                                null,
                                'Editar'
                            )
                        )
                        : null
                )
        }
    }
)

jest.mock(
    '../../../../src/features/support-network/screens/EditSupportCategoryScreen',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        return {
            EditSupportCategoryScreen: ({
                categoria,
                editarCategoria,
                onVoltar,
                onCategoriaAtualizada,
                onConcluido
            }) =>
                React.createElement(
                    View,
                    {
                        testID:
                            'edicao-categoria'
                    },
                    React.createElement(
                        Text,
                        null,
                        `Editando ${categoria.nome}`
                    ),
                    React.createElement(
                        Text,
                        {
                            testID:
                                'estado-servico-edicao'
                        },
                        typeof editarCategoria
                            === 'function'
                            ? 'Serviço conectado'
                            : 'Serviço ausente'
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                'Simular categoria atualizada',
                            onPress: () =>
                                onCategoriaAtualizada(
                                    mockCategoriaAtualizada
                                )
                        }
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                'Concluir edição',
                            onPress:
                                onConcluido
                        }
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                'Voltar da edição',
                            onPress: onVoltar
                        }
                    )
                )
        }
    }
)

import {
    SupportCategoriesScreen
} from '../../../../src/features/support-network/screens/SupportCategoriesScreen'

function criarEstadoHook(
    alteracoes = {}
) {
    return {
        categorias: [categoria],
        carregando: false,
        atualizando: false,
        erro: null,
        tentarNovamente:
            jest.fn(),
        atualizarLista:
            jest.fn(),
        adicionarCategoria:
            jest.fn(),
        atualizarCategoria:
            jest.fn(),
        removerCategoria:
            jest.fn(),
        ...alteracoes
    }
}

describe(
    'SupportCategoriesScreen edição integrada',
    () => {
        beforeEach(() => {
            mockUseSupportCategories
                .mockReset()

            mockUseSupportCategories
                .mockReturnValue(
                    criarEstadoHook()
                )
        })

        test(
            'abre a edição ao selecionar uma categoria',
            async () => {
                const editarCategoria =
                    jest.fn()

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn(),
                            editarCategoria
                        }}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Editar categoria de teste'
                        }
                    )
                )

                expect(
                    screen.getByTestId(
                        'edicao-categoria'
                    )
                ).toBeOnTheScreen()

                expect(
                    screen.getByText(
                        'Editando Família'
                    )
                ).toBeOnTheScreen()

                expect(
                    screen.getByText(
                        'Serviço conectado'
                    )
                ).toBeOnTheScreen()
            }
        )

        test(
            'substitui a categoria no estado local após a atualização',
            async () => {
                const atualizarCategoria =
                    jest.fn()

                mockUseSupportCategories
                    .mockReturnValue(
                        criarEstadoHook({
                            atualizarCategoria
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn(),
                            editarCategoria:
                                jest.fn()
                        }}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Editar categoria de teste'
                        }
                    )
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Simular categoria atualizada'
                        }
                    )
                )

                expect(
                    atualizarCategoria
                ).toHaveBeenCalledWith(
                    mockCategoriaAtualizada
                )

                expect(
                    screen.getByText(
                        'Editando Parceiro(a)'
                    )
                ).toBeOnTheScreen()
            }
        )

        test(
            'volta para a lista após concluir a edição',
            async () => {
                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn(),
                            editarCategoria:
                                jest.fn()
                        }}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Editar categoria de teste'
                        }
                    )
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Concluir edição'
                        }
                    )
                )

                expect(
                    screen.getByTestId(
                        'lista-categorias'
                    )
                ).toBeOnTheScreen()

                expect(
                    screen.queryByTestId(
                        'edicao-categoria'
                    )
                ).toBeNull()
            }
        )

        test(
            'volta para a lista sem atualizar ao cancelar a edição',
            async () => {
                const atualizarCategoria =
                    jest.fn()

                mockUseSupportCategories
                    .mockReturnValue(
                        criarEstadoHook({
                            atualizarCategoria
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn(),
                            editarCategoria:
                                jest.fn()
                        }}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Editar categoria de teste'
                        }
                    )
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Voltar da edição'
                        }
                    )
                )

                expect(
                    screen.getByTestId(
                        'lista-categorias'
                    )
                ).toBeOnTheScreen()

                expect(
                    atualizarCategoria
                ).not.toHaveBeenCalled()
            }
        )

        test(
            'preserva o encaminhamento antigo quando o serviço de edição não existe',
            async () => {
                const onEditar =
                    jest.fn()

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn()
                        }}
                        onEditar={onEditar}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Editar categoria de teste'
                        }
                    )
                )

                expect(
                    onEditar
                ).toHaveBeenCalledWith(
                    categoria
                )

                expect(
                    screen.queryByTestId(
                        'edicao-categoria'
                    )
                ).toBeNull()
            }
        )
    }
)