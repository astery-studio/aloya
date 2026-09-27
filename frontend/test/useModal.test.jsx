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
    test('começa fechado por padrão', async () => {
        await render(<ComponenteDeTeste />)

        expect(
            screen.getByText('Modal fechado')
        ).toBeOnTheScreen()
    })

    test('abre o modal', async () => {
        await render(<ComponenteDeTeste />)

        await fireEvent.press(
            screen.getByRole(
                'button',
                { name: 'Abrir' }
            )
        )

        expect(
            screen.getByText('Modal aberto')
        ).toBeOnTheScreen()
    })

    test('fecha o modal', async () => {
        await render(
            <ComponenteDeTeste
                abertoInicialmente
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                { name: 'Fechar' }
            )
        )

        expect(
            screen.getByText('Modal fechado')
        ).toBeOnTheScreen()
    })

    test('pode começar aberto quando solicitado', async () => {
        await render(
            <ComponenteDeTeste
                abertoInicialmente
            />
        )

        expect(
            screen.getByText('Modal aberto')
        ).toBeOnTheScreen()
    })

    test('abrir duas vezes mantém o modal aberto', async () => {
        await render(<ComponenteDeTeste />)

        const botaoAbrir =
            screen.getByRole(
                'button',
                { name: 'Abrir' }
            )

        await fireEvent.press(botaoAbrir)
        await fireEvent.press(botaoAbrir)

        expect(
            screen.getByText('Modal aberto')
        ).toBeOnTheScreen()
    })

    test('fechar duas vezes mantém o modal fechado', async () => {
        await render(<ComponenteDeTeste />)

        const botaoFechar =
            screen.getByRole(
                'button',
                { name: 'Fechar' }
            )

        await fireEvent.press(botaoFechar)
        await fireEvent.press(botaoFechar)

        expect(
            screen.getByText('Modal fechado')
        ).toBeOnTheScreen()
    })
})