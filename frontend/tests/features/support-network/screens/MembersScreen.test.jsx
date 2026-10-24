//Testa o conteúdo e as ações da tela principal de membros.
import {fireEvent, render, screen} from '@testing-library/react-native'

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen', () => {
    const React = require('react')
    const {Pressable, Text} = require('react-native')

    function ButtonScreen({
        texto,
        aoPressionar,
        rotuloAcessibilidade
    }) {
        const desativado = typeof aoPressionar !== 'function'

        return React.createElement(
            Pressable,
            {
                onPress: aoPressionar,
                disabled: desativado,
                accessibilityRole: 'button',
                accessibilityLabel: rotuloAcessibilidade,
                accessibilityState: {
                    disabled: desativado
                }
            },
            React.createElement(Text, null, texto)
        )
    }

    return {
        __esModule: true,
        default: ButtonScreen
    }
})

jest.mock('../../../../src/shared/layouts/MainLayout/MainLayout', () => {
    const React = require('react')
    const {Pressable, Text, View} = require('react-native')

    function MainLayout({
        titulo,
        abaAtiva,
        onSelecionarAba,
        children
    }) {
        return React.createElement(
            View,
            null,
            React.createElement(Text, null, titulo),
            React.createElement(
                Text,
                null,
                `Aba ativa: ${abaAtiva}`
            ),
            children,
            React.createElement(
                Pressable,
                {
                    onPress: () => onSelecionarAba?.('configuracoes'),
                    disabled: typeof onSelecionarAba !== 'function',
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Selecionar aba Configurações'
                },
                React.createElement(Text, null, 'Configurações')
            )
        )
    }

    return {MainLayout}
})

import {MembersScreen} from '../../../../src/features/support-network/screens/MembersScreen'

describe('MembersScreen', () => {
    test('mostra o conteúdo principal da tela de membros', async () => {
        await render(<MembersScreen />)

        expect(screen.getByText('Membros')).toBeOnTheScreen()
        expect(
            screen.getByText('Categorias de membros')
        ).toBeOnTheScreen()
        expect(
            screen.getByText(
                /Crie categorias para definir quais informações/
            )
        ).toBeOnTheScreen()
        expect(
            screen.getByText('Aba ativa: membros')
        ).toBeOnTheScreen()
        expect(
            screen.getByText('Criar nova categoria')
        ).toBeOnTheScreen()
    })

    test('inicia a criação de uma nova categoria', async () => {
        const onCriarCategoria = jest.fn()

        await render(
            <MembersScreen
                onCriarCategoria={onCriarCategoria}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Criar nova categoria de membros'
            })
        )

        expect(onCriarCategoria).toHaveBeenCalledTimes(1)
    })

    test('desabilita o botão quando não existe ação de criação', async () => {
        await render(<MembersScreen />)

        expect(
            screen.getByRole('button', {
                name: 'Criar nova categoria de membros'
            })
        ).toBeDisabled()
    })

    test('encaminha a seleção do menu inferior', async () => {
        const onSelecionarAba = jest.fn()

        await render(
            <MembersScreen
                onSelecionarAba={onSelecionarAba}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Selecionar aba Configurações'
            })
        )

        expect(onSelecionarAba).toHaveBeenCalledTimes(1)
        expect(onSelecionarAba).toHaveBeenCalledWith(
            'configuracoes'
        )
    })
})
