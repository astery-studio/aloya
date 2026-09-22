import {fireEvent, render, screen} from '@testing-library/react-native'

jest.mock(
    'phosphor-react-native/src/icons/ArrowLeft',
    () => ({
        ArrowLeftIcon: jest.fn(() => null)
    })
)

import {ArrowLeftIcon} from 'phosphor-react-native/src/icons/ArrowLeft'
import {estilos,corIconeVoltar} from '../components/navigation/Header/Header.style'
import {Header} from '../components/navigation/Header/Header'

describe('Header', () => {
    beforeEach(() => {
        ArrowLeftIcon.mockClear()
    })

    test('renderiza o título como cabeçalho', async () => {
        await render(
            <Header
                titulo="Configurações"
            />
        )

        const titulo =
            screen.getByRole('header')

        expect(titulo).toHaveTextContent(
            'Configurações'
        )

        expect(titulo).toHaveStyle(
            estilos.titulo
        )
    })

    test('não mostra o botão de voltar na variante padrão', async () => {
        await render(
            <Header
                titulo="Configurações"
            />
        )

        expect(
            screen.queryByRole(
                'button',
                {
                    name: 'Voltar'
                }
            )
        ).toBeNull()

        expect(
            ArrowLeftIcon
        ).not.toHaveBeenCalled()
    })

    test('mostra o botão de voltar na variante comVoltar', async () => {
        await render(
            <Header
                titulo="Perfil"
                variante="comVoltar"
                onVoltar={jest.fn()}
            />
        )

        const botaoVoltar =
            screen.getByRole(
                'button',
                {
                    name: 'Voltar'
                }
            )

        expect(botaoVoltar).toBeEnabled()
    })

    test('executa a ação quando o botão de voltar é pressionado', async () => {
        const onVoltar = jest.fn()

        await render(
            <Header
                titulo="Perfil"
                variante="comVoltar"
                onVoltar={onVoltar}
            />
        )

        await fireEvent.press(
            screen.getByRole(
                'button',
                {
                    name: 'Voltar'
                }
            )
        )

        expect(onVoltar).toHaveBeenCalledTimes(1)
    })

    test('desabilita o botão de voltar quando não recebe uma ação', async () => {
        await render(
            <Header
                titulo="Perfil"
                variante="comVoltar"
            />
        )

        const botaoVoltar =
            screen.getByRole(
                'button',
                {
                    name: 'Voltar'
                }
            )

        expect(botaoVoltar).toBeDisabled()

        await fireEvent.press(botaoVoltar)

        expect(botaoVoltar).toBeDisabled()
    })

    test('usa o estilo de título da variante comVoltar', async () => {
        await render(
            <Header
                titulo="Editar perfil"
                variante="comVoltar"
                onVoltar={jest.fn()}
            />
        )

        const titulo =
            screen.getByRole('header')

        expect(titulo).toHaveStyle(
            estilos.tituloComVoltar
        )

        expect(titulo).toHaveStyle({
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 27,
            textAlign: 'center'
        })
    })

    test('renderiza o ícone de voltar com as propriedades corretas', async () => {
        await render(
            <Header
                titulo="Perfil"
                variante="comVoltar"
                onVoltar={jest.fn()}
            />
        )

        expect(
            ArrowLeftIcon
        ).toHaveBeenCalledTimes(1)

        expect(
            ArrowLeftIcon.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                size: 24,
                color: corIconeVoltar,
                weight: 'regular'
            })
        )
    })

    test('trata uma variante desconhecida como a variante padrão', async () => {
        await render(
            <Header
                titulo="Título padrão"
                variante="varianteInexistente"
                onVoltar={jest.fn()}
            />
        )

        expect(
            screen.getByRole('header')
        ).toHaveTextContent(
            'Título padrão'
        )

        expect(
            screen.queryByRole(
                'button',
                {
                    name: 'Voltar'
                }
            )
        ).toBeNull()
    })
})