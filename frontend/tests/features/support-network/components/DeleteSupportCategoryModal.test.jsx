//Testa as variantes simples e com contatos do modal de exclusão.
import React from 'react'
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

jest.mock(
    '../../../../src/shared/components/icons/AppIcons',
    () => {
        const React = require('react')
        const {View} =
            require('react-native')

        function criarIcone(nome) {
            return function IconeFalso() {
                return React.createElement(
                    View,
                    {
                        testID: nome
                    }
                )
            }
        }

        return {
            CheckIcon:
                criarIcone('CheckIcon'),
            WarningCircleIcon:
                criarIcone(
                    'WarningCircleIcon'
                )
        }
    }
)

jest.mock(
    '../../../../src/shared/components/feedback/BottomSheet/BottomSheet',
    () => {
        const React = require('react')
        const {View} =
            require('react-native')

        return {
            BottomSheet: ({
                visivel,
                children
            }) =>
                visivel
                    ? React.createElement(
                        View,
                        {
                            testID:
                                'bottom-sheet-exclusao'
                        },
                        children
                    )
                    : null
        }
    }
)

jest.mock(
    '../../../../src/shared/layouts/BottomSheet/BottomSheetLayout',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        return {
            BottomSheetLayout: ({
                titulo,
                onFechar,
                bloquearFechamento,
                children
            }) =>
                React.createElement(
                    View,
                    null,
                    React.createElement(
                        Text,
                        null,
                        titulo
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole:
                                'button',
                            accessibilityLabel:
                                'Fechar painel',
                            disabled:
                                bloquearFechamento,
                            onPress: onFechar
                        }
                    ),
                    children
                )
        }
    }
)

import {
    DeleteSupportCategoryModal
} from '../../../../src/features/support-network/components/DeleteSupportCategoryModal'
import {
    ACOES_EXCLUSAO_CATEGORIA
} from '../../../../src/features/support-network/constants/categoryDeletionOptions'

const categoria = Object.freeze({
    id: 7,
    nome: 'Família',
    atualizadoEm:
        '2026-10-26T12:00:00.000Z'
})

const contatos = Object.freeze([
    Object.freeze({
        vinculoId: 20,
        nome: 'Ana Martins'
    }),
    Object.freeze({
        vinculoId: 21,
        nome: 'Carlos Martins'
    })
])

describe(
    'DeleteSupportCategoryModal',
    () => {
        test(
            'não renderiza quando está invisível',
            async () => {
                await render(
                    <DeleteSupportCategoryModal
                        visivel={false}
                        categoria={categoria}
                        contatos={[]}
                        onConfirmar={jest.fn()}
                        onCancelar={jest.fn()}
                    />
                )

                expect(
                    screen.queryByText(
                        'Apagar categoria'
                    )
                ).toBeNull()
            }
        )

        test(
            'mostra a confirmação simples quando não existem contatos',
            async () => {
                await render(
                    <DeleteSupportCategoryModal
                        visivel
                        categoria={categoria}
                        contatos={[]}
                        onConfirmar={jest.fn()}
                        onCancelar={jest.fn()}
                    />
                )

                expect(
                    screen.getByText(
                        'Apagar categoria'
                    )
                ).toBeOnTheScreen()

                expect(
                    screen.getByText(
                        'Tem certeza que deseja excluir a categoria “Família”? Esta ação não pode ser desfeita.'
                    )
                ).toBeOnTheScreen()
            }
        )

        test(
            'confirma a exclusão simples com uma lista vazia',
            async () => {
                const onConfirmar =
                    jest.fn()

                await render(
                    <DeleteSupportCategoryModal
                        visivel
                        categoria={categoria}
                        contatos={[]}
                        onConfirmar={
                            onConfirmar
                        }
                        onCancelar={jest.fn()}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name: 'Apagar'
                        }
                    )
                )

                expect(
                    onConfirmar
                ).toHaveBeenCalledWith([])
            }
        )

        test(
            'abre a variante estendida quando existem contatos',
            async () => {
                await render(
                    <DeleteSupportCategoryModal
                        visivel
                        categoria={categoria}
                        contatos={contatos}
                        decisoes={{}}
                        onAlterarDecisao={
                            jest.fn()
                        }
                        onAplicarATodos={
                            jest.fn()
                        }
                        onConfirmar={jest.fn()}
                        onCancelar={jest.fn()}
                    />
                )

                expect(
                    screen.getByText(
                        'Remover categoria'
                    )
                ).toBeOnTheScreen()

                expect(
                    screen.getByText(
                        'Ana Martins'
                    )
                ).toBeOnTheScreen()

                expect(
                    screen.getByText(
                        'Carlos Martins'
                    )
                ).toBeOnTheScreen()
            }
        )

        test(
            'mantém a confirmação desabilitada enquanto falta uma decisão',
            async () => {
                await render(
                    <DeleteSupportCategoryModal
                        visivel
                        categoria={categoria}
                        contatos={contatos}
                        decisoes={{
                            20:
                                ACOES_EXCLUSAO_CATEGORIA
                                    .removerAcesso
                        }}
                        onAlterarDecisao={
                            jest.fn()
                        }
                        onAplicarATodos={
                            jest.fn()
                        }
                        onConfirmar={jest.fn()}
                        onCancelar={jest.fn()}
                    />
                )

                expect(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Confirmar exclusão da categoria'
                        }
                    )
                ).toBeDisabled()
            }
        )

        test(
            'encaminha uma decisão individual',
            async () => {
                const onAlterarDecisao =
                    jest.fn()

                await render(
                    <DeleteSupportCategoryModal
                        visivel
                        categoria={categoria}
                        contatos={contatos}
                        decisoes={{}}
                        onAlterarDecisao={
                            onAlterarDecisao
                        }
                        onAplicarATodos={
                            jest.fn()
                        }
                        onConfirmar={jest.fn()}
                        onCancelar={jest.fn()}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'radio',
                        {
                            name:
                                'Remover acesso de Ana Martins'
                        }
                    )
                )

                expect(
                    onAlterarDecisao
                ).toHaveBeenCalledWith(
                    20,
                    ACOES_EXCLUSAO_CATEGORIA
                        .removerAcesso
                )
            }
        )

        test(
            'encaminha a decisão de remover para todos',
            async () => {
                const onAplicarATodos =
                    jest.fn()

                await render(
                    <DeleteSupportCategoryModal
                        visivel
                        categoria={categoria}
                        contatos={contatos}
                        decisoes={{}}
                        onAlterarDecisao={
                            jest.fn()
                        }
                        onAplicarATodos={
                            onAplicarATodos
                        }
                        onConfirmar={jest.fn()}
                        onCancelar={jest.fn()}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'radio',
                        {
                            name:
                                'Remover acesso de todos'
                        }
                    )
                )

                expect(
                    onAplicarATodos
                ).toHaveBeenCalledWith(
                    ACOES_EXCLUSAO_CATEGORIA
                        .removerAcesso
                )
            }
        )

        test(
            'entrega as decisões completas ao confirmar',
            async () => {
                const onConfirmar =
                    jest.fn()

                await render(
                    <DeleteSupportCategoryModal
                        visivel
                        categoria={categoria}
                        contatos={contatos}
                        decisoes={{
                            20:
                                ACOES_EXCLUSAO_CATEGORIA
                                    .removerAcesso,
                            21:
                                ACOES_EXCLUSAO_CATEGORIA
                                    .manterAcessoIndividual
                        }}
                        onAlterarDecisao={
                            jest.fn()
                        }
                        onAplicarATodos={
                            jest.fn()
                        }
                        onConfirmar={
                            onConfirmar
                        }
                        onCancelar={jest.fn()}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Confirmar exclusão da categoria'
                        }
                    )
                )

                expect(
                    onConfirmar
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
            'bloqueia fechamento e ações durante a exclusão',
            async () => {
                const onCancelar =
                    jest.fn()

                await render(
                    <DeleteSupportCategoryModal
                        visivel
                        categoria={categoria}
                        contatos={contatos}
                        decisoes={{
                            20:
                                'remover_acesso',
                            21:
                                'remover_acesso'
                        }}
                        onAlterarDecisao={
                            jest.fn()
                        }
                        onAplicarATodos={
                            jest.fn()
                        }
                        onConfirmar={jest.fn()}
                        onCancelar={
                            onCancelar
                        }
                        carregando
                    />
                )

                const fechar =
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Fechar painel'
                        }
                    )

                const confirmar =
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Confirmar exclusão da categoria'
                        }
                    )

                expect(fechar).toBeDisabled()
                expect(confirmar).toBeDisabled()

                await fireEvent.press(fechar)

                expect(
                    onCancelar
                ).not.toHaveBeenCalled()
            }
        )
    }
)