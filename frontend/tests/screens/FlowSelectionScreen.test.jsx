import {fireEvent, render, screen} from '@testing-library/react-native'

import {FlowSelectionScreen} from '../../screens/testing/FlowSelectionScreen'

describe('FlowSelectionScreen', () => {
    test('abre os dois fluxos disponíveis', async () => {
        const onAbrirConfiguracoes = jest.fn()
        const onAbrirNovaCategoria = jest.fn()

        await render(
            <FlowSelectionScreen
                onAbrirConfiguracoes={onAbrirConfiguracoes}
                onAbrirNovaCategoria={onAbrirNovaCategoria}
            />
        )

        await fireEvent.press(screen.getByRole('button', {name: 'Abrir fluxo de configurações'}))
        await fireEvent.press(screen.getByRole('button', {name: 'Abrir fluxo de criação de categoria'}))

        expect(onAbrirConfiguracoes).toHaveBeenCalledTimes(1)
        expect(onAbrirNovaCategoria).toHaveBeenCalledTimes(1)
    })
})
