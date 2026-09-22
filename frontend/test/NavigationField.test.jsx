import {fireEvent, render, screen} from '@testing-library/react-native'

jest.mock(
    'phosphor-react-native/src/icons/CaretRight',
    () => ({
        CaretRightIcon: jest.fn(() => null)
    })
)

import {tema} from '../theme'

import {
    estilos
} from '../components/common/NavigationField/NavigationField.style'

import {
    NavigationField
} from '../components/common/NavigationField/NavigationField'

const IconeTeste = jest.fn(() => null)

describe('NavigationField', () => {
    beforeEach(() => {
        IconeTeste.mockClear()
    })

    test('renderiza o label e as informações de acessibilidade', async () => {
        await render(
            <NavigationField
                label="Configurações de perfil"
                onPress={jest.fn()}
            />
        )

        const botao =
            screen.getByRole(
                'button',
                {
                    name: 'Configurações de perfil'
                }
            )

        expect(
            screen.getByText(
                'Configurações de perfil'
            )
        ).toBeOnTheScreen()

        expect(botao).toHaveProp(
            'accessibilityHint',
            'Abre outra tela ou painel'
        )
    })

    test('executa a ação quando o campo é pressionado', async () => {
        const onPress = jest.fn()

        await render(
            <NavigationField
                label="Alterar senha"
                onPress={onPress}
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name: 'Alterar senha'
                }
            )
        )

        expect(onPress).toHaveBeenCalledTimes(1)
    })

    test('fica desabilitado quando não recebe uma ação', async () => {
        await render(
            <NavigationField
                label="Sem ação"
            />
        )

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Sem ação'
                }
            )
        ).toBeDisabled()
    })

    test('não executa a ação quando está desabilitado', async () => {
        const onPress = jest.fn()

        await render(
            <NavigationField
                label="Campo desabilitado"
                desabilitado
                onPress={onPress}
            />
        )

        const botao =
            screen.getByRole(
                'button',
                {
                    name: 'Campo desabilitado'
                }
            )

        expect(botao).toBeDisabled()

        await fireEvent.press(botao)

        expect(onPress).not.toHaveBeenCalled()
    })

    test('permite no máximo duas linhas no label', async () => {
        const label =
            'Texto comprido para verificar o limite de linhas'

        await render(
            <NavigationField
                label={label}
                onPress={jest.fn()}
            />
        )

        expect(
            screen.getByText(label)
        ).toHaveProp(
            'numberOfLines',
            2
        )
    })

    test('usa os estilos da variante com borda por padrão', async () => {
        await render(
            <NavigationField
                label="Com borda"
                onPress={jest.fn()}
            />
        )

        const botao =
            screen.getByRole(
                'button',
                {
                    name: 'Com borda'
                }
            )

        expect(botao).toHaveStyle(
            estilos.container
        )

        expect(botao).not.toHaveStyle(
            estilos.semBorda
        )

        expect(botao).not.toHaveStyle(
            estilos.botao
        )
    })

    test('usa os estilos da variante sem borda', async () => {
        await render(
            <NavigationField
                label="Sem borda"
                variante="semBorda"
                onPress={jest.fn()}
            />
        )

        const botao =
            screen.getByRole(
                'button',
                {
                    name: 'Sem borda'
                }
            )

        expect(botao).toHaveStyle(
            estilos.container
        )

        expect(botao).toHaveStyle(
            estilos.semBorda
        )
    })

    test('usa os estilos da variante botão', async () => {
        await render(
            <NavigationField
                label="Botão"
                variante="botao"
                onPress={jest.fn()}
            />
        )

        const botao =
            screen.getByRole(
                'button',
                {
                    name: 'Botão'
                }
            )

        expect(botao).toHaveStyle(
            estilos.container
        )

        expect(botao).toHaveStyle(
            estilos.botao
        )
    })

    test('renderiza o ícone menor na variante com borda', async () => {
        await render(
            <NavigationField
                label="Ícone normal"
                icone={IconeTeste}
                onPress={jest.fn()}
            />
        )

        expect(
            IconeTeste.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                size: 20,
                weight: 'regular'
            })
        )
    })

    test.each([
        [
            'semBorda'
        ],
        [
            'botao'
        ]
    ])(
        'renderiza o ícone maior na variante %s',
        async (variante) => {
            await render(
                <NavigationField
                    label={`Variante ${variante}`}
                    variante={variante}
                    icone={IconeTeste}
                    onPress={jest.fn()}
                />
            )

            expect(
                IconeTeste.mock.calls[0][0]
            ).toEqual(
                expect.objectContaining({
                    size: 24,
                    weight: 'regular'
                })
            )
        }
    )

    test.each([
        [
            'corVerde',
            tema.cores.icones.configuracoes
                .verde.icone
        ],
        [
            'corAzul',
            tema.cores.icones.configuracoes
                .azul.icone
        ],
        [
            'corLaranja',
            tema.cores.icones.configuracoes
                .laranja.icone
        ],
        [
            'corVermelho',
            tema.cores.icones.anticoncepcionais
                .vermelho.icone
        ],
        [
            'corVerde2',
            tema.cores.icones.anticoncepcionais
                .verde.icone
        ]
    ])(
        'usa a cor correta da paleta %s',
        async (paleta, corEsperada) => {
            await render(
                <NavigationField
                    label={`Paleta ${paleta}`}
                    paleta={paleta}
                    icone={IconeTeste}
                    onPress={jest.fn()}
                />
            )

            expect(
                IconeTeste.mock.calls[0][0]
            ).toEqual(
                expect.objectContaining({
                    color: corEsperada
                })
            )
        }
    )

    test('usa a paleta verde quando recebe uma paleta desconhecida', async () => {
        await render(
            <NavigationField
                label="Paleta desconhecida"
                paleta="paletaInexistente"
                icone={IconeTeste}
                onPress={jest.fn()}
            />
        )

        expect(
            IconeTeste.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                color:
                    tema.cores.icones
                        .configuracoes
                        .verde
                        .icone
            })
        )
    })

    test('não tenta renderizar um ícone quando ele não é informado', async () => {
        await render(
            <NavigationField
                label="Sem ícone"
                onPress={jest.fn()}
            />
        )

        expect(
            IconeTeste
        ).not.toHaveBeenCalled()
    })
})