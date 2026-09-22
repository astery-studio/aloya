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
})