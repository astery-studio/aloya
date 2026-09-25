import {Animated, Text} from 'react-native'
import {act, render, screen} from '@testing-library/react-native'
import {BottomSheet} from '../../components/feedback/Bottomsheet/BottomSheet'

function obterModal(container) {
    const modais =
        container.queryAll(
            (elemento) =>
                elemento.props.transparent === true
                && elemento.props.animationType === 'none'
                && typeof elemento.props.onRequestClose
                    === 'function'
        )

    return modais[0]
}

describe('BottomSheet', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('renderiza o conteúdo quando está visível', async () => {
        await render(
            <BottomSheet
                visivel
                onFechar={jest.fn()}
            >
                <Text>Conteúdo do painel</Text>
            </BottomSheet>
        )

        expect(
            screen.getByText('Conteúdo do painel')
        ).toBeOnTheScreen()
    })

    test('configura o modal como transparente e sem animação automática', async () => {
        const resultado =
            await render(
                <BottomSheet
                    visivel
                    onFechar={jest.fn()}
                >
                    <Text>Conteúdo</Text>
                </BottomSheet>
            )

        const modal =
            obterModal(resultado.container)

        expect(modal).toBeDefined()

        expect(modal).toHaveProp(
            'transparent',
            true
        )

        expect(modal).toHaveProp(
            'animationType',
            'none'
        )

        expect(modal).toHaveProp(
            'visible',
            true
        )
    })

    test('executa onFechar quando o sistema solicita o fechamento', async () => {
        const onFechar = jest.fn()

        const resultado =
            await render(
                <BottomSheet
                    visivel
                    onFechar={onFechar}
                >
                    <Text>Conteúdo</Text>
                </BottomSheet>
            )

        const modal =
            obterModal(resultado.container)

        await act(async () => {
            modal.props.onRequestClose()
        })

        expect(onFechar).toHaveBeenCalledTimes(1)
    })

    test('não fecha quando o fechamento está bloqueado', async () => {
        const onFechar = jest.fn()

        const resultado =
            await render(
                <BottomSheet
                    visivel
                    onFechar={onFechar}
                    bloquearFechamento
                >
                    <Text>Salvando...</Text>
                </BottomSheet>
            )

        const modal =
            obterModal(resultado.container)

        await act(async () => {
            modal.props.onRequestClose()
        })

        expect(onFechar).not.toHaveBeenCalled()
    })

    test('não apresenta erro quando não recebe onFechar', async () => {
        const resultado =
            await render(
                <BottomSheet
                    visivel
                >
                    <Text>Conteúdo</Text>
                </BottomSheet>
            )

        const modal =
            obterModal(resultado.container)

        await act(async () => {
            modal.props.onRequestClose()
        })

        expect(
            screen.getByText('Conteúdo')
        ).toBeOnTheScreen()
    })

    test('inicia a animação de entrada quando o modal aparece', async () => {
        const iniciar = jest.fn()

        const timing =
            jest.spyOn(
                Animated,
                'timing'
            ).mockReturnValue({
                start: iniciar
            })

        const resultado =
            await render(
                <BottomSheet
                    visivel
                    onFechar={jest.fn()}
                >
                    <Text>Conteúdo</Text>
                </BottomSheet>
            )

        const modal =
            obterModal(resultado.container)

        await act(async () => {
            modal.props.onShow()
        })

        expect(timing).toHaveBeenCalledTimes(1)

        expect(
            timing.mock.calls[0][1]
        ).toEqual(
            expect.objectContaining({
                toValue: 1,
                duration: 280,
                useNativeDriver: true,
                isInteraction: false
            })
        )

        expect(iniciar).toHaveBeenCalledTimes(1)
    })

    test('inicia a animação de saída quando visivel muda para falso', async () => {
        const iniciar = jest.fn()

        const timing =
            jest.spyOn(
                Animated,
                'timing'
            ).mockReturnValue({
                start: iniciar
            })

        const resultado =
            await render(
                <BottomSheet
                    visivel
                    onFechar={jest.fn()}
                >
                    <Text>Conteúdo</Text>
                </BottomSheet>
            )

        await resultado.rerender(
            <BottomSheet
                visivel={false}
                onFechar={jest.fn()}
            >
                <Text>Conteúdo</Text>
            </BottomSheet>
        )

        expect(timing).toHaveBeenCalledTimes(1)

        expect(
            timing.mock.calls[0][1]
        ).toEqual(
            expect.objectContaining({
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
                isInteraction: false
            })
        )

        expect(iniciar).toHaveBeenCalledTimes(1)
    })

    test('mantém o conteúdo montado enquanto a saída não terminou', async () => {
        jest.spyOn(
            Animated,
            'timing'
        ).mockReturnValue({
            start: jest.fn()
        })

        const resultado =
            await render(
                <BottomSheet
                    visivel
                    onFechar={jest.fn()}
                >
                    <Text>Conteúdo durante saída</Text>
                </BottomSheet>
            )

        await resultado.rerender(
            <BottomSheet
                visivel={false}
                onFechar={jest.fn()}
            >
                <Text>Conteúdo durante saída</Text>
            </BottomSheet>
        )

        expect(
            screen.getByText(
                'Conteúdo durante saída'
            )
        ).toBeOnTheScreen()
    })

    test('desmonta o conteúdo depois que a animação de saída termina', async () => {
        let concluirSaida

        jest.spyOn(
            Animated,
            'timing'
        ).mockImplementation(
            (_, configuracao) => ({
                start: (callback) => {
                    if (configuracao.toValue === 0) {
                        concluirSaida = callback
                    }
                }
            })
        )

        const resultado =
            await render(
                <BottomSheet
                    visivel
                    onFechar={jest.fn()}
                >
                    <Text>Conteúdo temporário</Text>
                </BottomSheet>
            )

        await resultado.rerender(
            <BottomSheet
                visivel={false}
                onFechar={jest.fn()}
            >
                <Text>Conteúdo temporário</Text>
            </BottomSheet>
        )

        expect(
            screen.getByText(
                'Conteúdo temporário'
            )
        ).toBeOnTheScreen()

        expect(concluirSaida).toEqual(
            expect.any(Function)
        )

        await act(async () => {
            concluirSaida({
                finished: true
            })
        })

        expect(
            screen.queryByText(
                'Conteúdo temporário'
            )
        ).toBeNull()
    })

    test('não desmonta o conteúdo quando a animação é interrompida', async () => {
        let concluirSaida

        jest.spyOn(
            Animated,
            'timing'
        ).mockImplementation(
            (_, configuracao) => ({
                start: (callback) => {
                    if (configuracao.toValue === 0) {
                        concluirSaida = callback
                    }
                }
            })
        )

        const resultado =
            await render(
                <BottomSheet
                    visivel
                    onFechar={jest.fn()}
                >
                    <Text>Conteúdo preservado</Text>
                </BottomSheet>
            )

        await resultado.rerender(
            <BottomSheet
                visivel={false}
                onFechar={jest.fn()}
            >
                <Text>Conteúdo preservado</Text>
            </BottomSheet>
        )

        await act(async () => {
            concluirSaida({
                finished: false
            })
        })

        expect(
            screen.getByText(
                'Conteúdo preservado'
            )
        ).toBeOnTheScreen()
    })
})