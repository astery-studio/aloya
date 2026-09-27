import {fireEvent, render, screen} from '@testing-library/react-native'

jest.mock(
    'phosphor-react-native/src/icons/CaretLeft',
    () => ({
        CaretLeftIcon: jest.fn(() => null)
    })
)

jest.mock(
    'phosphor-react-native/src/icons/CaretRight',
    () => ({
        CaretRightIcon: jest.fn(() => null)
    })
)

jest.mock(
    'phosphor-react-native/src/icons/CaretDown',
    () => ({
        CaretDownIcon: jest.fn(() => null)
    })
)

jest.mock(
    '../components/feedback/Bottomsheet/BottomSheet',
    () => {
        const React = require('react')
        const {View} = require('react-native')

        function BottomSheet({
            children,
            visivel,
            onFechar,
            bloquearFechamento
        }) {
            return React.createElement(
                View,
                {
                    testID: 'bottom-sheet',
                    visivel,
                    onFechar,
                    bloquearFechamento
                },
                children
            )
        }

        return {
            BottomSheet
        }
    }
)

jest.mock(
    '../layouts/BottomSheet/BottomSheetLayout',
    () => {
        const React = require('react')
        const {
            Text,
            View
        } = require('react-native')

        function BottomSheetLayout({
            children,
            titulo,
            onFechar,
            bloquearFechamento
        }) {
            return React.createElement(
                View,
                {
                    testID: 'bottom-sheet-layout',
                    onFechar,
                    bloquearFechamento
                },
                React.createElement(
                    Text,
                    null,
                    titulo
                ),
                children
            )
        }

        return {
            BottomSheetLayout
        }
    }
)

import {DatePickerSheet} from '../components/feedback/DatePickerSheet/DatePickerSheet'
const mensagemDeErro = 'Não foi possível salvar a data. Tente novamente.'

describe('DatePickerSheet', () => {
    test('renderiza o mês, o ano e a data selecionada', async () => {
        await render(
            <DatePickerSheet
                visivel
                titulo="Data de nascimento"
                valorSelecionado="2026-09-21"
                onSelecionar={jest.fn()}
                onFechar={jest.fn()}
            />
        )

        expect(
            screen.getByText('Data de nascimento')
        ).toBeOnTheScreen()

        expect(
            screen.getByText('Setembro')
        ).toBeOnTheScreen()

        expect(
            screen.getByText('2026')
        ).toBeOnTheScreen()

        const diaSelecionado =
            screen.getByRole(
                'button',
                {
                    name:
                        'Dia 21 de Setembro de 2026'
                }
            )

        expect(diaSelecionado).toBeSelected()

        expect(
            screen.getByText('Dom')
        ).toBeOnTheScreen()

        expect(
            screen.getByText('Sáb')
        ).toBeOnTheScreen()
    })

    test('navega entre meses e anos', async () => {
        await render(
            <DatePickerSheet
                visivel
                valorSelecionado="2026-01-15"
                onSelecionar={jest.fn()}
                onFechar={jest.fn()}
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name: 'Mês anterior'
                }
            )
        )

        expect(
            screen.getByText('Dezembro')
        ).toBeOnTheScreen()

        expect(
            screen.getByText('2025')
        ).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name: 'Próximo mês'
                }
            )
        )

        expect(
            screen.getByText('Janeiro')
        ).toBeOnTheScreen()

        expect(
            screen.getByText('2026')
        ).toBeOnTheScreen()
    })

    test('respeita as datas mínima e máxima', async () => {
        await render(
            <DatePickerSheet
                visivel
                valorSelecionado="2026-05-15"
                dataMinima="2026-05-10"
                dataMaxima="2026-05-20"
                onSelecionar={jest.fn()}
                onFechar={jest.fn()}
            />
        )

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Mês anterior'
                }
            )
        ).toBeDisabled()

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Próximo mês'
                }
            )
        ).toBeDisabled()

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Dia 9 de Maio de 2026'
                }
            )
        ).toBeDisabled()

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Dia 10 de Maio de 2026'
                }
            )
        ).toBeEnabled()

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Dia 20 de Maio de 2026'
                }
            )
        ).toBeEnabled()

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Dia 21 de Maio de 2026'
                }
            )
        ).toBeDisabled()
    })

    test('salva a data e fecha o painel quando a seleção funciona', async () => {
        const onSelecionar =
            jest.fn().mockResolvedValue(
                undefined
            )

        const onFechar = jest.fn()

        await render(
            <DatePickerSheet
                visivel
                valorSelecionado="2026-09-21"
                onSelecionar={onSelecionar}
                onFechar={onFechar}
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name:
                        'Dia 22 de Setembro de 2026'
                }
            )
        )

        expect(
            onSelecionar
        ).toHaveBeenCalledTimes(1)

        expect(
            onSelecionar
        ).toHaveBeenCalledWith(
            '2026-09-22'
        )

        expect(onFechar).toHaveBeenCalledTimes(1)

        expect(
            screen.queryByText(mensagemDeErro)
        ).toBeNull()
    })

    test('mantém o painel aberto quando onSelecionar retorna false', async () => {
        const onSelecionar =
            jest.fn().mockResolvedValue(false)

        const onFechar = jest.fn()

        await render(
            <DatePickerSheet
                visivel
                valorSelecionado="2026-09-21"
                onSelecionar={onSelecionar}
                onFechar={onFechar}
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name:
                        'Dia 22 de Setembro de 2026'
                }
            )
        )

        expect(onFechar).not.toHaveBeenCalled()

        expect(
            screen.getByText(mensagemDeErro)
        ).toBeOnTheScreen()

        expect(
            screen.getByText(mensagemDeErro)
        ).toHaveProp(
            'accessibilityLiveRegion',
            'polite'
        )
    })

    test('mostra erro quando onSelecionar lança uma exceção', async () => {
        const onSelecionar =
            jest.fn().mockRejectedValue(
                new Error('Falha ao salvar')
            )

        const onFechar = jest.fn()

        await render(
            <DatePickerSheet
                visivel
                valorSelecionado="2026-09-21"
                onSelecionar={onSelecionar}
                onFechar={onFechar}
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name:
                        'Dia 22 de Setembro de 2026'
                }
            )
        )

        expect(onFechar).not.toHaveBeenCalled()

        expect(
            screen.getByText(mensagemDeErro)
        ).toBeOnTheScreen()
    })

    test('mostra erro quando não recebe onSelecionar', async () => {
        const onFechar = jest.fn()

        await render(
            <DatePickerSheet
                visivel
                valorSelecionado="2026-09-21"
                onFechar={onFechar}
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name:
                        'Dia 22 de Setembro de 2026'
                }
            )
        )

        expect(onFechar).not.toHaveBeenCalled()

        expect(
            screen.getByText(mensagemDeErro)
        ).toBeOnTheScreen()
    })

    test('permite escolher um mês pela lista', async () => {
        await render(
            <DatePickerSheet
                visivel
                valorSelecionado="2026-09-21"
                onSelecionar={jest.fn()}
                onFechar={jest.fn()}
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name: 'Escolher mês'
                }
            )
        )

        const abril =
            screen.getByRole(
                'button',
                {
                    name: 'Abril de 2026'
                }
            )

        expect(abril).toBeEnabled()

        await fireEvent.press(abril)

        expect(
            screen.getByText('Abril')
        ).toBeOnTheScreen()

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Dia 1 de Abril de 2026'
                }
            )
        ).toBeOnTheScreen()
    })
})