//Testa o conteúdo e as ações da tela principal de membros.
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

jest.mock(
    '../../../../src/shared/components/common/Button/ButtonScreen',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text
        } = require('react-native')

        function ButtonScreen({
            texto,
            aoPressionar,
            rotuloAcessibilidade
        }) {
            const desativado =
                typeof aoPressionar
                !== 'function'

            return React.createElement(
                Pressable,
                {
                    onPress:
                        aoPressionar,
                    disabled:
                        desativado,
                    accessibilityRole:
                        'button',
                    accessibilityLabel:
                        rotuloAcessibilidade,
                    accessibilityState: {
                        disabled:
                            desativado
                    }
                },
                React.createElement(
                    Text,
                    null,
                    texto
                )
            )
        }

        return {
            __esModule: true,
            default: ButtonScreen
        }
    }
)

jest.mock(
    '../../../../src/shared/layouts/MainLayout/MainLayout',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function MainLayout({
            titulo,
            abaAtiva,
            onSelecionarAba,
            children
        }) {
            return React.createElement(
                View,
                null,
                React.createElement(
                    Text,
                    null,
                    titulo
                ),
                React.createElement(
                    Text,
                    null,
                    `Aba ativa: ${abaAtiva}`
                ),
                children,
                React.createElement(
                    Pressable,
                    {
                        onPress: () =>
                            onSelecionarAba?.(
                                'configuracoes'
                            ),
                        disabled:
                            typeof onSelecionarAba
                            !== 'function',
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Selecionar aba Configurações'
                    },
                    React.createElement(
                        Text,
                        null,
                        'Configurações'
                    )
                )
            )
        }

        return {MainLayout}
    }
)

import {
    MembersScreen
} from '../../../../src/features/support-network/screens/MembersScreen'

describe('MembersScreen', () => {
    test('mostra o conteúdo principal da Rede de Apoio', async () => {
        await render(
            <MembersScreen />
        )

        expect(
            screen.getByText(
                'Membros'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Categorias de membros'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                /Crie categorias para definir quais informações/
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Aba ativa: membros'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Categorias de Permissão'
            )
        ).toBeOnTheScreen()
    })

    test('abre a listagem de categorias', async () => {
        const onAbrirCategorias =
            jest.fn()

        await render(
            <MembersScreen
                onAbrirCategorias={
                    onAbrirCategorias
                }
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name:
                        'Abrir categorias de permissão'
                }
            )
        )

        expect(
            onAbrirCategorias
        ).toHaveBeenCalledTimes(1)
    })

    test('desabilita o acesso quando a ação não foi fornecida', async () => {
        await render(
            <MembersScreen />
        )

        expect(
            screen.getByRole(
                'button',
                {
                    name:
                        'Abrir categorias de permissão'
                }
            )
        ).toBeDisabled()
    })

    test('encaminha a seleção do menu inferior', async () => {
        const onSelecionarAba =
            jest.fn()

        await render(
            <MembersScreen
                onSelecionarAba={
                    onSelecionarAba
                }
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name:
                        'Selecionar aba Configurações'
                }
            )
        )

        expect(
            onSelecionarAba
        ).toHaveBeenCalledTimes(1)

        expect(
            onSelecionarAba
        ).toHaveBeenCalledWith(
            'configuracoes'
        )
    })
})