import {Animated, Text} from 'react-native'
import {act, render, screen, waitFor} from '@testing-library/react-native'
import {BottomSheet} from '../components/feedback/Bottomsheet/BottomSheet'

function obterModal(container) {
    return container.queryAll((elemento) => elemento.props.transparent === true && elemento.props.animationType === 'none')[0]
}

describe('BottomSheet - reabertura', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('monta o painel quando passa de oculto para visível', async () => {
        const resultado = await render(
            <BottomSheet visivel={false} onFechar={jest.fn()}>
                <Text>Conteúdo reaberto</Text>
            </BottomSheet>
        )

        expect(screen.queryByText('Conteúdo reaberto')).toBeNull()

        await resultado.rerender(
            <BottomSheet visivel onFechar={jest.fn()}>
                <Text>Conteúdo reaberto</Text>
            </BottomSheet>
        )

        await waitFor(() => {
            expect(obterModal(resultado.container)).toBeDefined()
        })

        expect(obterModal(resultado.container)).toHaveProp('visible', true)
        expect(screen.getByText('Conteúdo reaberto')).toBeOnTheScreen()
    })

    test('mantém o painel montado quando reabre durante a animação de saída', async () => {
        let concluirSaida

        const timing = jest.spyOn(Animated, 'timing').mockImplementation((_, configuracao) => ({
            start: (callback) => {
                if (configuracao.toValue === 0) {
                    concluirSaida = callback
                }
            }
        }))

        const resultado = await render(
            <BottomSheet visivel onFechar={jest.fn()}>
                <Text>Painel preservado</Text>
            </BottomSheet>
        )

        await act(async () => {
            obterModal(resultado.container).props.onShow()
        })

        await resultado.rerender(
            <BottomSheet visivel={false} onFechar={jest.fn()}>
                <Text>Painel preservado</Text>
            </BottomSheet>
        )

        await resultado.rerender(
            <BottomSheet visivel onFechar={jest.fn()}>
                <Text>Painel preservado</Text>
            </BottomSheet>
        )

        expect(timing.mock.calls.at(-1)[1]).toEqual(expect.objectContaining({
            toValue: 1
        }))

        await act(async () => {
            concluirSaida({finished: true})
        })

        expect(obterModal(resultado.container)).toHaveProp('visible', true)
        expect(screen.getByText('Painel preservado')).toBeOnTheScreen()
    })

    test('não inicia nova entrada quando o painel fica invisível', async () => {
        const timing = jest.spyOn(Animated, 'timing').mockReturnValue({
            start: jest.fn()
        })

        const resultado = await render(
            <BottomSheet visivel onFechar={jest.fn()}>
                <Text>Conteúdo temporário</Text>
            </BottomSheet>
        )

        const quandoModalAparecer = obterModal(resultado.container).props.onShow

        await resultado.rerender(
            <BottomSheet visivel={false} onFechar={jest.fn()}>
                <Text>Conteúdo temporário</Text>
            </BottomSheet>
        )

        await act(async () => {
            quandoModalAparecer()
        })

        expect(timing).toHaveBeenCalledTimes(1)
        expect(timing.mock.calls[0][1]).toEqual(expect.objectContaining({
            toValue: 0
        }))
    })
})