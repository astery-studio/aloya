//Testa os estados, as variantes, a acessibilidade e o comportamento do SwitchField.
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

    test('mostra o título e começa desligado por padrão', async () => {
        await render(<SwitchField titulo="Acesso à Fase Atual" aoAlterar={jest.fn()} />)

        const interruptor = screen.getByRole('switch', {name: 'Acesso à Fase Atual'})

        expect(screen.getByText('Acesso à Fase Atual')).toBeOnTheScreen()
        expect(interruptor).toHaveProp('accessibilityState', {checked: false, disabled: false})
    })

    test('solicita a ativação quando está desligado', async () => {
        const aoAlterar = jest.fn()

        await render(<SwitchField titulo="Receber dicas" aoAlterar={aoAlterar} />)
        fireEvent.press(screen.getByRole('switch', {name: 'Receber dicas'}))

        expect(aoAlterar).toHaveBeenCalledTimes(1)
        expect(aoAlterar).toHaveBeenCalledWith(true)
    })

    test('solicita a desativação quando está ligado', async () => {
        const aoAlterar = jest.fn()

        await render(<SwitchField titulo="Receber dicas" ativo aoAlterar={aoAlterar} />)
        fireEvent.press(screen.getByRole('switch', {name: 'Receber dicas'}))

        expect(aoAlterar).toHaveBeenCalledWith(false)
    })

    test('não executa ação quando está desabilitado', async () => {
        const aoAlterar = jest.fn()

        await render(<SwitchField titulo="Permissão indisponível" ativo desabilitado aoAlterar={aoAlterar} />)

        const interruptor = screen.getByRole('switch', {name: 'Permissão indisponível'})

        expect(interruptor).toBeDisabled()
        expect(interruptor).toHaveProp('accessibilityState', {checked: true, disabled: true})

        fireEvent.press(interruptor)

        expect(aoAlterar).not.toHaveBeenCalled()
    })

    test('fica desabilitado quando não recebe uma função de alteração', async () => {
        await render(<SwitchField titulo="Sem ação" />)

        expect(screen.getByRole('switch', {name: 'Sem ação'})).toBeDisabled()
    })

    test('limita títulos grandes a duas linhas', async () => {
        const titulo = 'Permissão com um título muito grande para ocupar apenas uma linha'

        await render(<SwitchField titulo={titulo} aoAlterar={jest.fn()} />)

        expect(screen.getByText(titulo)).toHaveProp('numberOfLines', 2)
    })

    test('aceita um estilo específico para o título', async () => {
        await render(<SwitchField titulo="Humor" estiloTitulo={{color: '#B04A70'}} aoAlterar={jest.fn()} />)

        expect(screen.getByText('Humor')).toHaveStyle({color: '#B04A70'})
    })

    test('mostra somente o interruptor na variante compacta', async () => {
        const aoAlterar = jest.fn()

        await render(
            <SwitchField
                titulo="Ciclo menstrual"
                somenteControle
                rotuloAcessibilidade="Ativar todas as permissões de ciclo menstrual"
                aoAlterar={aoAlterar}
            />
        )

        expect(screen.queryByText('Ciclo menstrual')).toBeNull()

        const interruptor = screen.getByRole('switch', {name: 'Ativar todas as permissões de ciclo menstrual'})

        expect(interruptor).toHaveStyle(estilos.controle)

        fireEvent.press(interruptor)

        expect(aoAlterar).toHaveBeenCalledWith(true)
    })

    test('anima o indicador para a posição ativa', async () => {
        await render(<SwitchField titulo="Permissão ativa" ativo aoAlterar={jest.fn()} />)

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
        expect(estilos.controle).toEqual(expect.objectContaining({width: 48, minHeight: 44}))
        expect(estilos.trilha).toEqual(expect.objectContaining({width: 48, height: 28}))
        expect(estilos.indicador).toEqual(expect.objectContaining({width: 22, height: 22, top: 3, left: 3}))
    })
})