import {Text} from 'react-native'
import {fireEvent,render,screen} from '@testing-library/react-native'

jest.mock(
    'phosphor-react-native/src/icons/X',
    () => ({
        XIcon: jest.fn(() => null)
    })
)

import {XIcon} from 'phosphor-react-native/src/icons/X'
import {estilos, corIconeFechar} from '../../layouts/BottomSheet/BottomSheetLayout.style'
import {BottomSheetLayout} from '../../layouts/BottomSheet/BottomSheetLayout'

describe('BottomSheetLayout', () => {
    beforeEach(() => {
        XIcon.mockClear()
    })

    test('renderiza o título e o conteúdo', async () => {
        await render(
            <BottomSheetLayout
                titulo="Selecionar opção"
                onFechar={jest.fn()}
            >
                <Text>
                    Conteúdo do painel
                </Text>
            </BottomSheetLayout>
        )

        expect(
            screen.getByText('Selecionar opção')
        ).toBeOnTheScreen()

        expect(
            screen.getByText('Conteúdo do painel')
        ).toBeOnTheScreen()
    })

    test('renderiza o botão de fechar com nome acessível', async () => {
        await render(
            <BottomSheetLayout
                titulo="Editar perfil"
                onFechar={jest.fn()}
            >
                <Text>Conteúdo</Text>
            </BottomSheetLayout>
        )

        const botaoFechar =
            screen.getByRole(
                'button',
                {
                    name: 'Fechar painel'
                }
            )

        expect(botaoFechar).toBeOnTheScreen()
        expect(botaoFechar).toBeEnabled()
    })

    test('executa a ação ao pressionar o botão de fechar', async () => {
        const onFechar = jest.fn()

        await render(
            <BottomSheetLayout
                titulo="Editar perfil"
                onFechar={onFechar}
            >
                <Text>Conteúdo</Text>
            </BottomSheetLayout>
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name: 'Fechar painel'
                }
            )
        )

        expect(onFechar).toHaveBeenCalledTimes(1)
    })

    test('não apresenta erro quando não recebe onFechar', async () => {
        await render(
            <BottomSheetLayout
                titulo="Painel sem ação"
            >
                <Text>Conteúdo</Text>
            </BottomSheetLayout>
        )

        const botaoFechar =
            screen.getByRole(
                'button',
                {
                    name: 'Fechar painel'
                }
            )

        expect(botaoFechar).toBeEnabled()

        await expect(
            fireEvent.press(botaoFechar)
        ).resolves.toBeUndefined()
    })

    test('desabilita o fechamento quando ele está bloqueado', async () => {
        const onFechar = jest.fn()

        await render(
            <BottomSheetLayout
                titulo="Salvando"
                onFechar={onFechar}
                bloquearFechamento
            >
                <Text>Salvando dados...</Text>
            </BottomSheetLayout>
        )

        const botaoFechar =
            screen.getByRole(
                'button',
                {
                    name: 'Fechar painel'
                }
            )

        expect(botaoFechar).toBeDisabled()

        await fireEvent.press(botaoFechar)

        expect(onFechar).not.toHaveBeenCalled()
    })

    test('volta a permitir o fechamento depois do desbloqueio', async () => {
        const onFechar = jest.fn()

        const resultado =
            await render(
                <BottomSheetLayout
                    titulo="Salvando"
                    onFechar={onFechar}
                    bloquearFechamento
                >
                    <Text>Conteúdo</Text>
                </BottomSheetLayout>
            )

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Fechar painel'
                }
            )
        ).toBeDisabled()

        await resultado.rerender(
            <BottomSheetLayout
                titulo="Edição concluída"
                onFechar={onFechar}
                bloquearFechamento={false}
            >
                <Text>Conteúdo</Text>
            </BottomSheetLayout>
        )

        const botaoFechar =
            screen.getByRole(
                'button',
                {
                    name: 'Fechar painel'
                }
            )

        expect(botaoFechar).toBeEnabled()

        await fireEvent.press(botaoFechar)

        expect(onFechar).toHaveBeenCalledTimes(1)
    })

    test('renderiza o ícone de fechar com as propriedades corretas', async () => {
        await render(
            <BottomSheetLayout
                titulo="Selecionar data"
                onFechar={jest.fn()}
            >
                <Text>Conteúdo</Text>
            </BottomSheetLayout>
        )

        expect(XIcon).toHaveBeenCalledTimes(1)

        expect(
            XIcon.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                size: 24,
                color: corIconeFechar,
                weight: 'regular'
            })
        )
    })

    test('aplica o estilo correto ao botão de fechar', async () => {
        await render(
            <BottomSheetLayout
                titulo="Selecionar data"
                onFechar={jest.fn()}
            >
                <Text>Conteúdo</Text>
            </BottomSheetLayout>
        )

        expect(
            screen.getByRole(
                'button',
                {
                    name: 'Fechar painel'
                }
            )
        ).toHaveStyle(
            estilos.botaoFechar
        )
    })
})