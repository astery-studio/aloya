//Testa as variantes, a acessibilidade e o bloqueio do botão compacto de ícone.
import {fireEvent, render, screen} from '@testing-library/react-native'

import {tema} from '../../../../src/shared/theme'
import {IconButton} from '../../../../src/shared/components/common/IconButton/IconButton'
import {estilos, variantes} from '../../../../src/shared/components/common/IconButton/IconButton.styles'

const IconeTeste = jest.fn(() => null)

describe('IconButton', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('mostra a variante neutra por padrão', async () => {
        await render(
            <IconButton
                icone={IconeTeste}
                aoPressionar={jest.fn()}
                rotuloAcessibilidade="Editar"
            />
        )

        const botao = screen.getByRole('button', {
            name: 'Editar'
        })

        expect(botao).toHaveStyle(estilos.container)
        expect(botao).toHaveStyle(variantes.neutro.container)

        expect(IconeTeste).toHaveBeenCalledWith(expect.objectContaining({
            size: 20,
            color: tema.cores.neutras.textoSecundarioClaro,
            weight: 'regular'
        }), undefined)
    })

    test('executa a ação somente uma vez ao ser pressionado', async () => {
        const aoPressionar = jest.fn()

        await render(
            <IconButton
                icone={IconeTeste}
                aoPressionar={aoPressionar}
                rotuloAcessibilidade="Abrir calendário"
            />
        )

        await fireEvent.press(screen.getByRole('button', {
            name: 'Abrir calendário'
        }))

        expect(aoPressionar).toHaveBeenCalledTimes(1)
    })

    test('usa a variante de perigo', async () => {
        await render(
            <IconButton
                icone={IconeTeste}
                aoPressionar={jest.fn()}
                rotuloAcessibilidade="Excluir"
                variante="perigo"
            />
        )

        expect(IconeTeste).toHaveBeenCalledWith(expect.objectContaining({
            color: tema.cores.feedback.erro
        }), undefined)

        expect(screen.getByRole('button', {
            name: 'Excluir'
        })).toHaveStyle(variantes.perigo.container)
    })

    test('usa a variante selecionada e informa o estado acessível', async () => {
        await render(
            <IconButton
                icone={IconeTeste}
                aoPressionar={jest.fn()}
                rotuloAcessibilidade="Calendário selecionado"
                variante="selecionado"
            />
        )

        const botao = screen.getByRole('button', {
            name: 'Calendário selecionado'
        })

        expect(botao).toHaveStyle(variantes.selecionado.container)
        expect(botao).toHaveProp('accessibilityState', {
            disabled: false,
            selected: true
        })
    })

    test('fica desativado quando recebe a propriedade desativado', async () => {
        const aoPressionar = jest.fn()

        await render(
            <IconButton
                icone={IconeTeste}
                aoPressionar={aoPressionar}
                rotuloAcessibilidade="Editar indisponível"
                desativado
            />
        )

        const botao = screen.getByRole('button', {
            name: 'Editar indisponível'
        })

        expect(botao).toBeDisabled()
        expect(botao).toHaveStyle(variantes.desativado.container)

        await fireEvent.press(botao)

        expect(aoPressionar).not.toHaveBeenCalled()
    })

    test('fica desativado quando recebe a variante desativado', async () => {
        const aoPressionar = jest.fn()

        await render(
            <IconButton
                icone={IconeTeste}
                aoPressionar={aoPressionar}
                rotuloAcessibilidade="Excluir indisponível"
                variante="desativado"
            />
        )

        const botao = screen.getByRole('button', {
            name: 'Excluir indisponível'
        })

        expect(botao).toBeDisabled()

        await fireEvent.press(botao)

        expect(aoPressionar).not.toHaveBeenCalled()
    })

    test('fica desativado quando não recebe uma função de ação', async () => {
        await render(
            <IconButton
                icone={IconeTeste}
                rotuloAcessibilidade="Informação indisponível"
            />
        )

        expect(screen.getByRole('button', {
            name: 'Informação indisponível'
        })).toBeDisabled()
    })

    test('remove espaços externos do rótulo acessível', async () => {
        await render(
            <IconButton
                icone={IconeTeste}
                aoPressionar={jest.fn()}
                rotuloAcessibilidade="  Abrir informações  "
            />
        )

        expect(screen.getByRole('button', {
            name: 'Abrir informações'
        })).toBeOnTheScreen()
    })

    test('mantém uma área de toque acessível', async () => {
        await render(
            <IconButton
                icone={IconeTeste}
                aoPressionar={jest.fn()}
                rotuloAcessibilidade="Abrir calendário"
            />
        )

        const botao = screen.getByRole('button', {
            name: 'Abrir calendário'
        })

        expect(botao).toHaveStyle({
            width: 44,
            minWidth: 44,
            height: 44,
            minHeight: 44
        })

        expect(botao).toHaveProp('hitSlop', 4)
    })

    test('rejeita uma variante inexistente', async () => {
        await expect(render(
            <IconButton
                icone={IconeTeste}
                aoPressionar={jest.fn()}
                rotuloAcessibilidade="Variante inválida"
                variante="inexistente"
            />
        )).rejects.toThrow('Variante de IconButton inválida: inexistente')
    })

    test('rejeita um botão sem ícone', async () => {
        await expect(render(
            <IconButton
                aoPressionar={jest.fn()}
                rotuloAcessibilidade="Sem ícone"
            />
        )).rejects.toThrow('IconButton precisa receber um ícone.')
    })

    test.each([
        undefined,
        '',
        '   '
    ])('rejeita o rótulo de acessibilidade inválido %p', async rotuloAcessibilidade => {
        await expect(render(
            <IconButton
                icone={IconeTeste}
                aoPressionar={jest.fn()}
                rotuloAcessibilidade={rotuloAcessibilidade}
            />
        )).rejects.toThrow('IconButton precisa de um rótulo de acessibilidade.')
    })
})