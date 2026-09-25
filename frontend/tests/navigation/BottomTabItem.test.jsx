import {fireEvent, render, screen} from '@testing-library/react-native'
import {estilos,corAtiva,corInativa} from '../../components/navigation/BottomTab/BottomTabItem/BottomTabItem.style'
import {BottomTabItem} from '../../components/navigation/BottomTab/BottomTabItem/BottomTabItem'

const IconeTeste = jest.fn(() => null)

describe('BottomTabItem', () => {
    beforeEach(() => {
        IconeTeste.mockClear()
    })

    test('renderiza o label e a função de aba', async () => {
        await render(
            <BottomTabItem
                label="Início"
                icone={IconeTeste}
                onPress={jest.fn()}
            />
        )

        expect(
            screen.getByText('Início')
        ).toBeOnTheScreen()

        expect(
            screen.getByRole(
                'tab',
                {
                    name: 'Início'
                }
            )
        ).toBeOnTheScreen()
    })

    test('executa a ação quando a aba é pressionada', async () => {
        const onPress = jest.fn()

        await render(
            <BottomTabItem
                label="Diário"
                icone={IconeTeste}
                onPress={onPress}
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'tab',
                {
                    name: 'Diário'
                }
            )
        )

        expect(onPress).toHaveBeenCalledTimes(1)
    })

    test('fica desabilitado quando não recebe uma ação', async () => {
        await render(
            <BottomTabItem
                label="Configurações"
                icone={IconeTeste}
            />
        )

        expect(
            screen.getByRole(
                'tab',
                {
                    name: 'Configurações'
                }
            )
        ).toBeDisabled()
    })

    test('informa que a aba está ativa', async () => {
        await render(
            <BottomTabItem
                label="Início"
                icone={IconeTeste}
                ativo
                onPress={jest.fn()}
            />
        )

        const aba =
            screen.getByRole(
                'tab',
                {
                    name: 'Início'
                }
            )

        expect(aba).toBeSelected()
        expect(aba).toBeEnabled()
    })

    test('informa que a aba está inativa por padrão', async () => {
        await render(
            <BottomTabItem
                label="Membros"
                icone={IconeTeste}
                onPress={jest.fn()}
            />
        )

        const aba =
            screen.getByRole(
                'tab',
                {
                    name: 'Membros'
                }
            )

        expect(aba).not.toBeSelected()
        expect(aba).toBeEnabled()
    })

    test('renderiza o ícone da aba ativa', async () => {
        await render(
            <BottomTabItem
                label="Início"
                icone={IconeTeste}
                ativo
                onPress={jest.fn()}
            />
        )

        expect(
            IconeTeste
        ).toHaveBeenCalledTimes(1)

        expect(
            IconeTeste.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                size: 26,
                color: corAtiva,
                weight: 'fill'
            })
        )
    })

    test('renderiza o ícone da aba inativa', async () => {
        await render(
            <BottomTabItem
                label="Ciclos"
                icone={IconeTeste}
                onPress={jest.fn()}
            />
        )

        expect(
            IconeTeste
        ).toHaveBeenCalledTimes(1)

        expect(
            IconeTeste.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                size: 26,
                color: corInativa,
                weight: 'regular'
            })
        )
    })

    test('mantém o label em uma única linha', async () => {
        await render(
            <BottomTabItem
                label="Configurações"
                icone={IconeTeste}
                onPress={jest.fn()}
            />
        )

        expect(
            screen.getByText('Configurações')
        ).toHaveProp(
            'numberOfLines',
            1
        )
    })

    test('aplica o estilo ativo somente ao label selecionado', async () => {
        const resultado =
            await render(
                <BottomTabItem
                    label="Início"
                    icone={IconeTeste}
                    ativo
                    onPress={jest.fn()}
                />
            )

        expect(
            screen.getByText('Início')
        ).toHaveStyle(
            estilos.labelAtiva
        )

        const pontosAtivos =
            resultado.container.queryAll(
                (elemento) =>
                    elemento.props.style
                    === estilos.pontoAtivo
            )

        expect(pontosAtivos).toHaveLength(1)
    })

    test('não renderiza o ponto ativo em uma aba inativa', async () => {
        const resultado =
            await render(
                <BottomTabItem
                    label="Diário"
                    icone={IconeTeste}
                    onPress={jest.fn()}
                />
            )

        const pontosAtivos =
            resultado.container.queryAll(
                (elemento) =>
                    elemento.props.style
                    === estilos.pontoAtivo
            )

        expect(pontosAtivos).toHaveLength(0)
    })
})