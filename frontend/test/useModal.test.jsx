import { Button, Text, View } from 'react-native'
import {fireEvent, render, screen} from '@testing-library/react-native'
import { useModal } from '../hooks/useModal'

function ComponenteDeTeste({abertoInicialmente = false}) {
    const {visivel, abrirModal, fecharModal} = useModal(abertoInicialmente)

    return (
        <View>
            <Text>
                {visivel ? 'Modal aberto' : 'Modal fechado'}
            </Text>

            <Button
                title="Abrir"
                onPress={abrirModal}
            />

            <Button
                title="Fechar"
                onPress={fecharModal}
            />
        </View>
    )
}

describe('useModal', () => {
    test('começa fechado por padrão', () => {
        render(<ComponenteDeTeste />)

        expect(
            screen.getByText('Modal fechado')
        ).toBeOnTheScreen()
    })

    test('abre o modal', () => {
        render(<ComponenteDeTeste />)

        fireEvent.press(
            screen.getByRole(
                'button',
                { name: 'Abrir' }
            )
        )

        expect(
            screen.getByText('Modal aberto')
        ).toBeOnTheScreen()
    })

    test('fecha o modal', () => {
        render(
            <ComponenteDeTeste
                abertoInicialmente
            />
        )

        fireEvent.press(
            screen.getByRole(
                'button',
                { name: 'Fechar' }
            )
        )

        expect(
            screen.getByText('Modal fechado')
        ).toBeOnTheScreen()
    })

    test('pode começar aberto quando solicitado', () => {
        render(
            <ComponenteDeTeste
                abertoInicialmente
            />
        )

        expect(
            screen.getByText('Modal aberto')
        ).toBeOnTheScreen()
    })

    test('abrir duas vezes mantém o modal aberto', () => {
        render(<ComponenteDeTeste />)

        const botaoAbrir =
            screen.getByRole(
                'button',
                { name: 'Abrir' }
            )

        fireEvent.press(botaoAbrir)
        fireEvent.press(botaoAbrir)

        expect(
            screen.getByText('Modal aberto')
        ).toBeOnTheScreen()
    })

    test('fechar duas vezes mantém o modal fechado', () => {
        render(<ComponenteDeTeste />)

        const botaoFechar =
            screen.getByRole(
                'button',
                { name: 'Fechar' }
            )

        fireEvent.press(botaoFechar)
        fireEvent.press(botaoFechar)

        expect(
            screen.getByText('Modal fechado')
        ).toBeOnTheScreen()
    })
})