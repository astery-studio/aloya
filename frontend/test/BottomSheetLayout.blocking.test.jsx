jest.mock('../components/icons/AppIcons', () => ({
    XIcon: jest.fn(() => null)
}))

import {BottomSheetLayout} from '../layouts/BottomSheet/BottomSheetLayout'

function obterBotaoFechar(componente) {
    const [cabecalho] = componente.props.children
    const [, botaoFechar] = cabecalho.props.children

    return botaoFechar
}

describe('BottomSheetLayout - bloqueio', () => {
    test('ignora diretamente o fechamento quando está bloqueado', () => {
        const onFechar = jest.fn()

        const componente = BottomSheetLayout({
            titulo: 'Salvando',
            onFechar,
            bloquearFechamento: true,
            children: 'Conteúdo'
        })

        const botaoFechar = obterBotaoFechar(componente)

        expect(botaoFechar.props.disabled).toBe(true)

        expect(() => {
            botaoFechar.props.onPress()
        }).not.toThrow()

        expect(onFechar).not.toHaveBeenCalled()
    })

    test('executa diretamente o fechamento quando está liberado', () => {
        const onFechar = jest.fn()

        const componente = BottomSheetLayout({
            titulo: 'Editar perfil',
            onFechar,
            bloquearFechamento: false,
            children: 'Conteúdo'
        })

        const botaoFechar = obterBotaoFechar(componente)

        expect(botaoFechar.props.disabled).toBe(false)

        botaoFechar.props.onPress()

        expect(onFechar).toHaveBeenCalledTimes(1)
    })
})