import {fireEvent,render,screen} from '@testing-library/react-native'

jest.mock(
    '../../components/feedback/Bottomsheet/BottomSheet',
    () => {
        const React = require('react')
        const {View} = require('react-native')

        function BottomSheet({
            children,
            visivel,
            onFechar
        }) {
            return React.createElement(
                View,
                {
                    testID: 'bottom-sheet',
                    visivel,
                    onFechar
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
    '../../layouts/BottomSheet/BottomSheetLayout',
    () => {
        const React = require('react')
        const {
            Text,
            View
        } = require('react-native')

        function BottomSheetLayout({
            children,
            titulo,
            onFechar
        }) {
            return React.createElement(
                View,
                {
                    testID: 'bottom-sheet-layout',
                    onFechar
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

import {SelectionSheet} from '../../components/feedback/SelectionSheet/SelectionSheet'

const IconeTeste = jest.fn(() => null)

const opcoes = [
    {
        id: 'mensal',
        label: 'Mensal',
        descricao: 'Uma vez por mês'
    },
    {
        id: 'trimestral',
        label: 'Trimestral',
        descricao: 'Uma vez a cada três meses'
    },
    {
        id: 'anual',
        label: 'Anual'
    }
]

describe('SelectionSheet', () => {
    beforeEach(() => {
        IconeTeste.mockClear()
    })

    test('renderiza o título e encaminha as propriedades do painel', async () => {
        const onFechar = jest.fn()

        await render(
            <SelectionSheet
                visivel
                titulo="Selecionar frequência"
                opcoes={opcoes}
                valorSelecionado="mensal"
                onSelecionar={jest.fn()}
                onFechar={onFechar}
            />
        )

        expect(
            screen.getByText(
                'Selecionar frequência'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByTestId('bottom-sheet')
        ).toHaveProp(
            'visivel',
            true
        )

        expect(
            screen.getByTestId('bottom-sheet')
        ).toHaveProp(
            'onFechar',
            onFechar
        )

        expect(
            screen.getByTestId(
                'bottom-sheet-layout'
            )
        ).toHaveProp(
            'onFechar',
            onFechar
        )
    })

    test('renderiza todas as opções e descrições', async () => {
        await render(
            <SelectionSheet
                visivel
                titulo="Selecionar frequência"
                opcoes={opcoes}
                valorSelecionado="mensal"
                onSelecionar={jest.fn()}
            />
        )

        expect(
            screen.getByText('Mensal')
        ).toBeOnTheScreen()

        expect(
            screen.getByText('Trimestral')
        ).toBeOnTheScreen()

        expect(
            screen.getByText('Anual')
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Uma vez por mês'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Uma vez a cada três meses'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getAllByRole('button')
        ).toHaveLength(3)
    })

    test('marca somente a opção selecionada', async () => {
        await render(
            <SelectionSheet
                visivel
                titulo="Selecionar frequência"
                opcoes={opcoes}
                valorSelecionado="trimestral"
                onSelecionar={jest.fn()}
            />
        )

        const botoes =
            screen.getAllByRole('button')

        expect(botoes[0]).not.toBeSelected()
        expect(botoes[1]).toBeSelected()
        expect(botoes[2]).not.toBeSelected()
    })

    test('envia o id correto quando uma opção é pressionada', async () => {
        const onSelecionar = jest.fn()

        await render(
            <SelectionSheet
                visivel
                titulo="Selecionar frequência"
                opcoes={opcoes}
                valorSelecionado="mensal"
                onSelecionar={onSelecionar}
            />
        )

        const botoes =
            screen.getAllByRole('button')

        await fireEvent.press(botoes[1])

        expect(
            onSelecionar
        ).toHaveBeenCalledTimes(1)

        expect(
            onSelecionar
        ).toHaveBeenCalledWith(
            'trimestral'
        )
    })

    test('exibe uma mensagem quando não existem opções', async () => {
        await render(
            <SelectionSheet
                visivel
                titulo="Selecionar opção"
                opcoes={[]}
                onSelecionar={jest.fn()}
            />
        )

        expect(
            screen.getByText(
                'Nenhuma opção disponível.'
            )
        ).toBeOnTheScreen()

        expect(
            screen.queryAllByRole('button')
        ).toHaveLength(0)
    })

    test('encaminha o ícone da opção para o botão', async () => {
        const opcoesComIcone = [
            {
                id: 'opcao-com-icone',
                label: 'Opção com ícone',
                icone: IconeTeste
            }
        ]

        await render(
            <SelectionSheet
                visivel
                titulo="Selecionar opção"
                opcoes={opcoesComIcone}
                valorSelecionado="opcao-com-icone"
                onSelecionar={jest.fn()}
            />
        )

        expect(IconeTeste).toHaveBeenCalledTimes(1)

        expect(
            IconeTeste.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                size: 24
            })
        )
    })

    test('atualiza a opção selecionada quando o valor muda', async () => {
        const resultado =
            await render(
                <SelectionSheet
                    visivel
                    titulo="Selecionar frequência"
                    opcoes={opcoes}
                    valorSelecionado="mensal"
                    onSelecionar={jest.fn()}
                />
            )

        let botoes =
            screen.getAllByRole('button')

        expect(botoes[0]).toBeSelected()
        expect(botoes[1]).not.toBeSelected()

        await resultado.rerender(
            <SelectionSheet
                visivel
                titulo="Selecionar frequência"
                opcoes={opcoes}
                valorSelecionado="trimestral"
                onSelecionar={jest.fn()}
            />
        )

        botoes =
            screen.getAllByRole('button')

        expect(botoes[0]).not.toBeSelected()
        expect(botoes[1]).toBeSelected()
    })
})
