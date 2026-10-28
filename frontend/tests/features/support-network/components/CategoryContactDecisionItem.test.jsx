//Testa as decisões individuais usadas ao excluir uma categoria com contatos.
import React from 'react'
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

import {
    CategoryContactDecisionItem
} from '../../../../src/features/support-network/components/CategoryContactDecisionItem'
import {
    ACOES_EXCLUSAO_CATEGORIA
} from '../../../../src/features/support-network/constants/categoryDeletionOptions'
import {
    COR_PERIGO
} from '../../../../src/features/support-network/components/CategoryDecisionOption.styles'
import {
    cores
} from '../../../../src/shared/theme'

const contato = Object.freeze({
    vinculoId: 21,
    nome: 'Ana Martins'
})

describe(
    'CategoryContactDecisionItem',
    () => {
        test(
            'começa sem decisão selecionada',
            async () => {
                await render(
                    <CategoryContactDecisionItem
                        contato={contato}
                        onAlterarDecisao={
                            jest.fn()
                        }
                    />
                )

                expect(
                    screen.getByText(
                        'Ana Martins'
                    )
                ).toBeOnTheScreen()

                const remover =
                    screen.getByRole(
                        'radio',
                        {
                            name:
                                'Remover acesso de Ana Martins'
                        }
                    )

                const manter =
                    screen.getByRole(
                        'radio',
                        {
                            name:
                                'Manter acesso individual de Ana Martins'
                        }
                    )

                expect(
                    remover.props
                        .accessibilityState
                ).toEqual({
                    checked: false,
                    disabled: false
                })

                expect(
                    manter.props
                        .accessibilityState
                ).toEqual({
                    checked: false,
                    disabled: false
                })
            }
        )

        test(
            'seleciona a remoção do acesso',
            async () => {
                const onAlterarDecisao =
                    jest.fn()

                await render(
                    <CategoryContactDecisionItem
                        contato={contato}
                        onAlterarDecisao={
                            onAlterarDecisao
                        }
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
                    21,
                    ACOES_EXCLUSAO_CATEGORIA
                        .removerAcesso
                )
            }
        )

        test(
            'seleciona a manutenção individual',
            async () => {
                const onAlterarDecisao =
                    jest.fn()

                await render(
                    <CategoryContactDecisionItem
                        contato={contato}
                        onAlterarDecisao={
                            onAlterarDecisao
                        }
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'radio',
                        {
                            name:
                                'Manter acesso individual de Ana Martins'
                        }
                    )
                )

                expect(
                    onAlterarDecisao
                ).toHaveBeenCalledWith(
                    21,
                    ACOES_EXCLUSAO_CATEGORIA
                        .manterAcessoIndividual
                )
            }
        )

        test(
            'mostra visualmente a decisão de remover',
            async () => {
                await render(
                    <CategoryContactDecisionItem
                        contato={contato}
                        decisao={
                            ACOES_EXCLUSAO_CATEGORIA
                                .removerAcesso
                        }
                        onAlterarDecisao={
                            jest.fn()
                        }
                    />
                )

                const remover =
                    screen.getByRole(
                        'radio',
                        {
                            name:
                                'Remover acesso de Ana Martins'
                        }
                    )

                expect(
                    remover.props
                        .accessibilityState
                        .checked
                ).toBe(true)

                expect(
                    screen.getByTestId(
                        'indicador-remover'
                    )
                ).toHaveStyle({
                    borderColor:
                        COR_PERIGO,
                    backgroundColor:
                        COR_PERIGO
                })
            }
        )

        test(
            'mostra visualmente a decisão de manter',
            async () => {
                await render(
                    <CategoryContactDecisionItem
                        contato={contato}
                        decisao={
                            ACOES_EXCLUSAO_CATEGORIA
                                .manterAcessoIndividual
                        }
                        onAlterarDecisao={
                            jest.fn()
                        }
                    />
                )

                const manter =
                    screen.getByRole(
                        'radio',
                        {
                            name:
                                'Manter acesso individual de Ana Martins'
                        }
                    )

                expect(
                    manter.props
                        .accessibilityState
                        .checked
                ).toBe(true)

                expect(
                    screen.getByTestId(
                        'indicador-manter'
                    )
                ).toHaveStyle({
                    borderColor:
                        cores.marca
                            .secundaria,
                    backgroundColor:
                        cores.marca
                            .secundaria
                })
            }
        )

        test(
            'bloqueia as duas opções durante o carregamento',
            async () => {
                const onAlterarDecisao =
                    jest.fn()

                await render(
                    <CategoryContactDecisionItem
                        contato={contato}
                        onAlterarDecisao={
                            onAlterarDecisao
                        }
                        desabilitado
                    />
                )

                const remover =
                    screen.getByRole(
                        'radio',
                        {
                            name:
                                'Remover acesso de Ana Martins'
                        }
                    )

                const manter =
                    screen.getByRole(
                        'radio',
                        {
                            name:
                                'Manter acesso individual de Ana Martins'
                        }
                    )

                expect(
                    remover.props
                        .accessibilityState
                        .disabled
                ).toBe(true)

                expect(
                    manter.props
                        .accessibilityState
                        .disabled
                ).toBe(true)

                await fireEvent.press(remover)
                await fireEvent.press(manter)

                expect(
                    onAlterarDecisao
                ).not.toHaveBeenCalled()
            }
        )

        test(
            'bloqueia um contato com identificador inválido',
            async () => {
                const onAlterarDecisao =
                    jest.fn()

                await render(
                    <CategoryContactDecisionItem
                        contato={{
                            nome:
                                'Contato inválido'
                        }}
                        onAlterarDecisao={
                            onAlterarDecisao
                        }
                    />
                )

                const remover =
                    screen.getByRole(
                        'radio',
                        {
                            name:
                                'Remover acesso de Contato inválido'
                        }
                    )

                expect(
                    remover.props
                        .accessibilityState
                        .disabled
                ).toBe(true)

                await fireEvent.press(remover)

                expect(
                    onAlterarDecisao
                ).not.toHaveBeenCalled()
            }
        )
    }
)