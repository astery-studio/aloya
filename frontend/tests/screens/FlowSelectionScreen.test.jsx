//Testa todas as ações disponíveis na tela provisória de seleção de fluxos.
import {fireEvent, render, screen} from '@testing-library/react-native'

import {FlowSelectionScreen} from '../../screens/testing/FlowSelectionScreen'

describe('FlowSelectionScreen', () => {
    test('mostra os três fluxos disponíveis', async () => {
        await render(
            <FlowSelectionScreen
                onAbrirConfiguracoes={jest.fn()}
                onAbrirNovaCategoria={jest.fn()}
                onAbrirCategorias={jest.fn()}
            />
        )

        expect(screen.getByRole('button', {name: 'Abrir fluxo de configurações'})).toBeOnTheScreen()
        expect(screen.getByRole('button', {name: 'Abrir fluxo de criação de categoria'})).toBeOnTheScreen()
        expect(screen.getByRole('button', {name: 'Abrir categorias cadastradas'})).toBeOnTheScreen()
    })

    test('abre o fluxo de configurações', async () => {
        const onAbrirConfiguracoes = jest.fn()

        await render(
            <FlowSelectionScreen
                onAbrirConfiguracoes={onAbrirConfiguracoes}
                onAbrirNovaCategoria={jest.fn()}
                onAbrirCategorias={jest.fn()}
            />
        )

        await fireEvent.press(screen.getByRole('button', {name: 'Abrir fluxo de configurações'}))

        expect(onAbrirConfiguracoes).toHaveBeenCalledTimes(1)
    })

    test('abre o fluxo de criação de categoria', async () => {
        const onAbrirNovaCategoria = jest.fn()

        await render(
            <FlowSelectionScreen
                onAbrirConfiguracoes={jest.fn()}
                onAbrirNovaCategoria={onAbrirNovaCategoria}
                onAbrirCategorias={jest.fn()}
            />
        )

        await fireEvent.press(screen.getByRole('button', {name: 'Abrir fluxo de criação de categoria'}))

        expect(onAbrirNovaCategoria).toHaveBeenCalledTimes(1)
    })

    test('abre a consulta de categorias cadastradas', async () => {
        const onAbrirCategorias = jest.fn()

        await render(
            <FlowSelectionScreen
                onAbrirConfiguracoes={jest.fn()}
                onAbrirNovaCategoria={jest.fn()}
                onAbrirCategorias={onAbrirCategorias}
            />
        )

        await fireEvent.press(screen.getByRole('button', {name: 'Abrir categorias cadastradas'}))

        expect(onAbrirCategorias).toHaveBeenCalledTimes(1)
    })

    test('desabilita as opções quando as ações não foram fornecidas', async () => {
        await render(<FlowSelectionScreen />)

        expect(screen.getByRole('button', {name: 'Abrir fluxo de configurações'})).toBeDisabled()
        expect(screen.getByRole('button', {name: 'Abrir fluxo de criação de categoria'})).toBeDisabled()
        expect(screen.getByRole('button', {name: 'Abrir categorias cadastradas'})).toBeDisabled()
    })
})