import {fireEvent, render, screen} from '@testing-library/react-native'
import {corIconeNormal,corIconeSelecionado} from '../../components/common/Button/ButtonSelection/ButtonSelection.style'
import {ButtonSelection} from '../../components/common/Button/ButtonSelection/ButtonSelection'

const IconeTeste = jest.fn(() => null)

describe('ButtonSelection', () => {
    beforeEach(() => {
        IconeTeste.mockClear()
    })

    test('renderiza o label e a descrição', async () => {
        await render(
            <ButtonSelection
                label="Opção mensal"
                descricao="Uma vez por mês"
            />
        )

        expect(
            screen.getByText('Opção mensal')
        ).toBeOnTheScreen()

        expect(
            screen.getByText('Uma vez por mês')
        ).toBeOnTheScreen()
    })

    test('não renderiza uma descrição quando ela não é informada', async () => {
        await render(
            <ButtonSelection
                label="Opção sem descrição"
            />
        )

        expect(
            screen.getByText('Opção sem descrição')
        ).toBeOnTheScreen()

        expect(
            screen.queryByText('Uma vez por mês')
        ).toBeNull()
    })

    test('executa a ação quando a opção é pressionada', async () => {
        const onPress = jest.fn()

        await render(
            <ButtonSelection
                label="Selecionar opção"
                onPress={onPress}
            />
        )

        await fireEvent.press(
            screen.getByRole('button')
        )

        expect(onPress).toHaveBeenCalledTimes(1)
    })

    test('informa que a opção está selecionada', async () => {
        await render(
            <ButtonSelection
                label="Opção selecionada"
                selected
            />
        )

        const botao =
            screen.getByRole('button')

        expect(botao).toBeSelected()
        expect(botao).toBeEnabled()
    })

    test('informa que a opção não está selecionada por padrão', async () => {
        await render(
            <ButtonSelection
                label="Opção normal"
            />
        )

        const botao =
            screen.getByRole('button')

        expect(botao).not.toBeSelected()
        expect(botao).toBeEnabled()
    })

    test('não executa a ação quando está desabilitada', async () => {
        const onPress = jest.fn()

        await render(
            <ButtonSelection
                label="Opção desabilitada"
                desabilitado
                onPress={onPress}
            />
        )

        const botao =
            screen.getByRole('button')

        expect(botao).not.toBeSelected()
        expect(botao).toBeDisabled()

        await fireEvent.press(botao)

        expect(onPress).not.toHaveBeenCalled()
    })

    test('renderiza o ícone com o tamanho e a cor normais', async () => {
        await render(
            <ButtonSelection
                label="Opção com ícone"
                icone={IconeTeste}
            />
        )

        expect(
            IconeTeste
        ).toHaveBeenCalledTimes(1)

        expect(
            IconeTeste.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                size: 24,
                color: corIconeNormal
            })
        )
    })

    test('renderiza o ícone com a cor selecionada', async () => {
        await render(
            <ButtonSelection
                label="Opção selecionada"
                icone={IconeTeste}
                selected
            />
        )

        expect(
            IconeTeste
        ).toHaveBeenCalledTimes(1)

        expect(
            IconeTeste.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                size: 24,
                color: corIconeSelecionado
            })
        )
    })

    test('não tenta renderizar um ícone quando ele não é informado', async () => {
        await render(
            <ButtonSelection
                label="Opção sem ícone"
            />
        )

        expect(
            IconeTeste
        ).not.toHaveBeenCalled()
    })
})