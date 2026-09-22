import {fireEvent, render, screen} from '@testing-library/react-native'

import {tema} from '../theme'

import {
    estilos
} from '../components/common/NavigationField/NavigationField.style'

import {
    NavigationField
} from '../components/common/NavigationField/NavigationField'

const IconeTeste = jest.fn(() => null)

describe('NavigationField', () => {
    beforeEach(() => {
        IconeTeste.mockClear()
    })

    test('renderiza o label e as informações de acessibilidade', async () => {
        await render(
            <NavigationField
                label="Configurações de perfil"
                onPress={jest.fn()}
            />
        )

        const botao =
            screen.getByRole(
                'button',
                {
                    name: 'Configurações de perfil'
                }
            )

        expect(
            screen.getByText(
                'Configurações de perfil'
            )
        ).toBeOnTheScreen()

        expect(botao).toHaveProp(
            'accessibilityHint',
            'Abre outra tela ou painel'
        )
    })

    test('executa a ação quando o campo é pressionado', async () => {
        const onPress = jest.fn()

        await render(
            <NavigationField
                label="Alterar senha"
                onPress={onPress}
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name: 'Alterar senha'
                }
            )
        )

        expect(onPress).toHaveBeenCalledTimes(1)
    })

    test('fica desabilitado quando não recebe uma ação', async () => {
        await render(
            <NavigationField
                label="Sem ação"
            />
        )

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Sem ação'
                }
            )
        ).toBeDisabled()
    })

    test('não executa a ação quando está desabilitado', async () => {
        const onPress = jest.fn()

        await render(
            <NavigationField
                label="Campo desabilitado"
                desabilitado
                onPress={onPress}
            />
        )

        const botao =
            screen.getByRole(
                'button',
                {
                    name: 'Campo desabilitado'
                }
            )

        expect(botao).toBeDisabled()

        await fireEvent.press(botao)

        expect(onPress).not.toHaveBeenCalled()
    })

    test('permite no máximo duas linhas no label', async () => {
        const label =
            'Texto comprido para verificar o limite de linhas'

        await render(
            <NavigationField
                label={label}
                onPress={jest.fn()}
            />
        )

        expect(
            screen.getByText(label)
        ).toHaveProp(
            'numberOfLines',
            2
        )
    })

    test('usa os estilos da variante com borda por padrão', async () => {
        await render(
            <NavigationField
                label="Com borda"
                onPress={jest.fn()}
            />
        )

        const botao =
            screen.getByRole(
                'button',
                {
                    name: 'Com borda'
                }
            )

        expect(botao).toHaveStyle(
            estilos.container
        )

        expect(botao).not.toHaveStyle(
            estilos.semBorda
        )

        expect(botao).not.toHaveStyle(
            estilos.botao
        )
    })
})