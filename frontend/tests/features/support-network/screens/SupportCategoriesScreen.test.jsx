//Testa a composição e o encaminhamento de ações da tela de categorias.
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

jest.mock(
    '../../../../src/shared/components/navigation/Header/Header',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function Header({
            titulo,
            variante,
            onVoltar
        }) {
            const desabilitado =
                typeof onVoltar !== 'function'

            return React.createElement(
                View,
                {
                    testID:
                        'header-categorias'
                },
                React.createElement(
                    Text,
                    null,
                    titulo
                ),
                React.createElement(
                    Text,
                    null,
                    `Variante: ${variante}`
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Voltar',
                        accessibilityState: {
                            disabled:
                                desabilitado
                        },
                        disabled:
                            desabilitado,
                        onPress: onVoltar
                    },
                    React.createElement(
                        Text,
                        null,
                        'Voltar'
                    )
                )
            )
        }

        return {Header}
    }
)

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
    SupportCategoriesScreen
} from '../../../../src/features/support-network/screens/SupportCategoriesScreen'

const categoria = {
    id: 1,
    nome: 'Família',
    dadosVisiveis: [
        'geral.fase_atual'
    ],
    quantidadeContatos: 2
}

describe('SupportCategoriesScreen', () => {
    test('mostra o cabeçalho e a lista de categorias', async () => {
        await render(
            <SupportCategoriesScreen
                categorias={[categoria]}
                onVoltar={jest.fn()}
                onCriar={jest.fn()}
                onEditar={jest.fn()}
                onExcluir={jest.fn()}
            />
        )

        expect(
            screen.getByText(
                'Categorias de Permissão'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Variante: comVoltar'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText('Família')
        ).toBeOnTheScreen()

        expect(
            screen.getByTestId(
                'support-categories-screen'
            )
        ).toBeOnTheScreen()
    })

    test('encaminha a ação de voltar', async () => {
        const onVoltar = jest.fn()

        await render(
            <SupportCategoriesScreen
                onVoltar={onVoltar}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar'
            })
        )

        expect(
            onVoltar
        ).toHaveBeenCalledTimes(1)
    })

    test('encaminha a criação de categoria', async () => {
        const onCriar = jest.fn()

        await render(
            <SupportCategoriesScreen
                onCriar={onCriar}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Criar nova categoria de permissão'
            })
        )

        expect(
            onCriar
        ).toHaveBeenCalledTimes(1)
    })

    test('encaminha edição e exclusão da categoria', async () => {
        const onEditar = jest.fn()
        const onExcluir = jest.fn()

        await render(
            <SupportCategoriesScreen
                categorias={[categoria]}
                onEditar={onEditar}
                onExcluir={onExcluir}
                onCriar={jest.fn()}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Editar categoria Família'
            })
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Excluir categoria Família'
            })
        )

        expect(
            onEditar
        ).toHaveBeenCalledWith(
            categoria
        )

        expect(
            onExcluir
        ).toHaveBeenCalledWith(
            categoria
        )
    })

    test('mostra o estado de erro e encaminha nova tentativa', async () => {
        const onTentarNovamente =
            jest.fn()

        await render(
            <SupportCategoriesScreen
                erro="ERRO_REDE"
                onTentarNovamente={
                    onTentarNovamente
                }
            />
        )

        expect(
            screen.getByText(
                'Ocorreu um erro'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Não foi possível carregar suas categorias no momento. Tente novamente.'
            )
        ).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Tentar Novamente'
            })
        )

        expect(
            onTentarNovamente
        ).toHaveBeenCalledTimes(1)
    })

    test('mantém as categorias durante atualização secundária', async () => {
        await render(
            <SupportCategoriesScreen
                categorias={[categoria]}
                atualizando
                onCriar={jest.fn()}
            />
        )

        expect(
            screen.getByText('Família')
        ).toBeOnTheScreen()

        expect(
            screen.getByLabelText(
                'Atualizando categorias'
            )
        ).toBeOnTheScreen()
    })

    test('encaminha o estado da operação em andamento', async () => {
        await render(
            <SupportCategoriesScreen
                categorias={[categoria]}
                categoriaEmAndamentoId={1}
                acaoEmAndamento="excluir"
                onEditar={jest.fn()}
                onExcluir={jest.fn()}
                onCriar={jest.fn()}
            />
        )

        expect(
            screen.getByLabelText(
                'Excluindo categoria Família'
            )
        ).toBeOnTheScreen()
    })

    test('desabilita o retorno quando a ação não foi fornecida', async () => {
        await render(
            <SupportCategoriesScreen />
        )

        expect(
            screen.getByRole('button', {
                name: 'Voltar'
            })
        ).toBeDisabled()
    })
})