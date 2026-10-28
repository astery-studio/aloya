//Testa os dados, ações e bloqueios do cartão de categoria.
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

jest.mock(
    '../../../../src/shared/components/icons/AppIcons',
    () => {
        const React = require('react')
        const {View} = require('react-native')

        function criarIcone(nome) {
            return function IconeFalso(
                propriedades
            ) {
                return React.createElement(
                    View,
                    {
                        ...propriedades,
                        testID: nome
                    }
                )
            }
        }

        return {
            PencilSimpleIcon:
                criarIcone(
                    'PencilSimpleIcon'
                ),
            TrashIcon:
                criarIcone('TrashIcon'),
            UserIcon:
                criarIcone('UserIcon'),
            UsersIcon:
                criarIcone('UsersIcon')
        }
    }
)

import {
    criarRotuloContatos,
    SupportCategoryCard
} from '../../../../src/features/support-network/components/SupportCategoryCard'

const categoria = Object.freeze({
    id: 7,
    nome: 'Família',
    dadosVisiveis: [
        'geral.fase_atual'
    ],
    quantidadeContatos: 2
})

describe('SupportCategoryCard', () => {
    test('mostra os dados da categoria', () => {
        render(
            <SupportCategoryCard
                categoria={categoria}
                resumoPermissoes="3 tipos de dado permitidos"
                quantidadeContatos={2}
                onEditar={jest.fn()}
                onExcluir={jest.fn()}
            />
        )

        expect(
            screen.getByText('Família')
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                '3 tipos de dado permitidos'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByLabelText(
                '2 contatos vinculados'
            )
        ).toBeOnTheScreen()
    })

    test('encaminha a categoria para edição e exclusão', () => {
        const onEditar = jest.fn()
        const onExcluir = jest.fn()

        render(
            <SupportCategoryCard
                categoria={categoria}
                resumoPermissoes="Fase atual permitida"
                onEditar={onEditar}
                onExcluir={onExcluir}
            />
        )

        fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Editar categoria Família'
            })
        )

        fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Excluir categoria Família'
            })
        )

        expect(onEditar).toHaveBeenCalledWith(
            categoria
        )

        expect(onExcluir).toHaveBeenCalledWith(
            categoria
        )
    })

    test('bloqueia as ações quando está desabilitado', () => {
        const onEditar = jest.fn()
        const onExcluir = jest.fn()

        render(
            <SupportCategoryCard
                categoria={categoria}
                resumoPermissoes="Fase atual permitida"
                onEditar={onEditar}
                onExcluir={onExcluir}
                desabilitado
            />
        )

        expect(
            screen.getByRole('button', {
                name:
                    'Editar categoria Família'
            })
        ).toBeDisabled()

        expect(
            screen.getByRole('button', {
                name:
                    'Excluir categoria Família'
            })
        ).toBeDisabled()
    })

    test('mostra o estado da ação em andamento', () => {
        render(
            <SupportCategoryCard
                categoria={categoria}
                resumoPermissoes="Fase atual permitida"
                onEditar={jest.fn()}
                onExcluir={jest.fn()}
                acaoEmAndamento="excluir"
            />
        )

        expect(
            screen.getByLabelText(
                'Excluindo categoria Família'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByRole('button', {
                name:
                    'Editar categoria Família'
            })
        ).toBeDisabled()
    })

    test.each([
        [0, '0 contatos vinculados'],
        [1, '1 contato vinculado'],
        [2, '2 contatos vinculados'],
        [-1, '0 contatos vinculados']
    ])(
        'formata a quantidade %p como %s',
        (quantidade, esperado) => {
            expect(
                criarRotuloContatos(
                    Number.isSafeInteger(
                        quantidade
                    )
                    && quantidade >= 0
                        ? quantidade
                        : 0
                )
            ).toBe(esperado)
        }
    )

    test('não renderiza categoria sem nome', () => {
        render(
            <SupportCategoryCard
                categoria={{
                    ...categoria,
                    nome: '   '
                }}
                resumoPermissoes="Permissão"
            />
        )

        expect(
            screen.queryByTestId(
                'support-category-card'
            )
        ).toBeNull()
    })
})