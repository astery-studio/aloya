//Testa os estados, a acessibilidade e o comportamento do SwitchField.
import {Animated} from 'react-native'
import {fireEvent, render, screen} from '@testing-library/react-native'

import SwitchField from '../../components/forms/SwitchField/SwitchField'
import {estilos} from '../../components/forms/SwitchField/SwitchField.styles'

describe('SwitchField', () => {
    beforeEach(() => {
        jest.spyOn(Animated, 'timing').mockReturnValue({
            start: jest.fn(),
            stop: jest.fn()
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('mostra o título e começa desligado por padrão', () => {
        render(
            <SwitchField
                titulo="Acesso à Fase Atual"
                aoAlterar={jest.fn()}
            />
        )

        const interruptor = screen.getByRole('switch', {
            name: 'Acesso à Fase Atual'
        })

        expect(screen.getByText('Acesso à Fase Atual')).toBeOnTheScreen()

        expect(interruptor).toHaveProp('accessibilityState', {
            checked: false,
            disabled: false
        })
    })

    test('solicita a ativação quando está desligado', () => {
        const aoAlterar = jest.fn()

        render(
            <SwitchField
                titulo="Receber dicas"
                aoAlterar={aoAlterar}
            />
        )

        fireEvent.press(
            screen.getByRole('switch', {
                name: 'Receber dicas'
            })
        )

        expect(aoAlterar).toHaveBeenCalledTimes(1)
        expect(aoAlterar).toHaveBeenCalledWith(true)
    })

    test('solicita a desativação quando está ligado', () => {
        const aoAlterar = jest.fn()

        render(
            <SwitchField
                titulo="Receber dicas"
                ativo
                aoAlterar={aoAlterar}
            />
        )

        fireEvent.press(
            screen.getByRole('switch', {
                name: 'Receber dicas'
            })
        )

        expect(aoAlterar).toHaveBeenCalledWith(false)
    })

    test('não executa ação quando está desabilitado', () => {
        const aoAlterar = jest.fn()

        render(
            <SwitchField
                titulo="Permissão indisponível"
                ativo
                desabilitado
                aoAlterar={aoAlterar}
            />
        )

        const interruptor = screen.getByRole('switch', {
            name: 'Permissão indisponível'
        })

        expect(interruptor).toBeDisabled()

        expect(interruptor).toHaveProp('accessibilityState', {
            checked: true,
            disabled: true
        })

        fireEvent.press(interruptor)

        expect(aoAlterar).not.toHaveBeenCalled()
    })

    test('fica desabilitado quando não recebe uma função de alteração', () => {
        render(
            <SwitchField titulo="Sem ação" />
        )

        expect(
            screen.getByRole('switch', {
                name: 'Sem ação'
            })
        ).toBeDisabled()
    })

    test('limita títulos grandes a duas linhas', () => {
        const titulo = 'Permissão com um título muito grande para ocupar apenas uma linha'

        render(
            <SwitchField
                titulo={titulo}
                aoAlterar={jest.fn()}
            />
        )

        expect(screen.getByText(titulo)).toHaveProp('numberOfLines', 2)
    })

    test('anima o indicador para a posição ativa', () => {
        render(
            <SwitchField
                titulo="Permissão ativa"
                ativo
                aoAlterar={jest.fn()}
            />
        )

        expect(Animated.timing).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                toValue: 20,
                duration: 160,
                useNativeDriver: true
            })
        )
    })

    test('mantém as medidas definidas no protótipo', () => {
        expect(estilos.trilha).toEqual(
            expect.objectContaining({
                width: 48,
                height: 28
            })
        )

        expect(estilos.indicador).toEqual(
            expect.objectContaining({
                width: 22,
                height: 22,
                top: 3,
                left: 3
            })
        )
    })
})