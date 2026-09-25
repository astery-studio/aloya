//Testa os estados, as cores, a acessibilidade e as ações do PermissionItem.
import {Animated} from 'react-native'
import {fireEvent, render, screen} from '@testing-library/react-native'

import PermissionItem from '../../features/support-network/components/PermissionItem'
import {estilos, fundosAtivos} from '../../features/support-network/components/PermissionItem.styles'

describe('PermissionItem', () => {
    beforeEach(() => {
        jest.spyOn(Animated, 'timing').mockReturnValue({
            start: jest.fn(),
            stop: jest.fn()
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('mostra uma permissão desligada', async () => {
        await render(<PermissionItem titulo="Fluxo menstrual" aoAlterar={jest.fn()} />)

        const interruptor = screen.getByRole('switch', {name: 'Fluxo menstrual'})

        expect(screen.getByText('Fluxo menstrual')).toBeOnTheScreen()
        expect(screen.getByText('Fluxo menstrual')).toHaveStyle(estilos.tituloInativo)
        expect(interruptor).toHaveProp('accessibilityState', {checked: false, disabled: false})
    })

    test('mostra uma permissão ligada', async () => {
        await render(<PermissionItem titulo="Fluxo menstrual" ativo aoAlterar={jest.fn()} />)

        const interruptor = screen.getByRole('switch', {name: 'Fluxo menstrual'})

        expect(screen.getByText('Fluxo menstrual')).toHaveStyle(estilos.tituloAtivo)
        expect(interruptor).toHaveStyle(fundosAtivos.ciclo)
        expect(interruptor).toHaveProp('accessibilityState', {checked: true, disabled: false})
    })

    test('solicita a ativação da permissão', async () => {
        const aoAlterar = jest.fn()

        await render(<PermissionItem titulo="Pele" aoAlterar={aoAlterar} />)
        fireEvent.press(screen.getByRole('switch', {name: 'Pele'}))

        expect(aoAlterar).toHaveBeenCalledTimes(1)
        expect(aoAlterar).toHaveBeenCalledWith(true)
    })

    test('solicita a desativação da permissão', async () => {
        const aoAlterar = jest.fn()

        await render(<PermissionItem titulo="Pele" ativo aoAlterar={aoAlterar} />)
        fireEvent.press(screen.getByRole('switch', {name: 'Pele'}))

        expect(aoAlterar).toHaveBeenCalledWith(false)
    })

    test('não executa ação quando está desabilitado', async () => {
        const aoAlterar = jest.fn()

        await render(<PermissionItem titulo="Consultas" ativo desabilitado aoAlterar={aoAlterar} />)

        const interruptor = screen.getByRole('switch', {name: 'Consultas'})

        expect(interruptor).toBeDisabled()

        fireEvent.press(interruptor)

        expect(aoAlterar).not.toHaveBeenCalled()
    })

    test('fica desabilitado quando não recebe uma ação', async () => {
        await render(<PermissionItem titulo="Consultas" />)

        expect(screen.getByRole('switch', {name: 'Consultas'})).toBeDisabled()
    })

    test.each([
        ['ciclo', fundosAtivos.ciclo],
        ['corpo', fundosAtivos.corpo],
        ['emocional', fundosAtivos.emocional],
        ['energia', fundosAtivos.energia],
        ['vidaIntima', fundosAtivos.vidaIntima],
        ['saude', fundosAtivos.saude]
    ])('usa a paleta %s quando a permissão está ativa', async (paleta, estiloEsperado) => {
        await render(
            <PermissionItem
                titulo={`Permissão ${paleta}`}
                ativo
                paleta={paleta}
                aoAlterar={jest.fn()}
            />
        )

        expect(screen.getByRole('switch', {name: `Permissão ${paleta}`})).toHaveStyle(estiloEsperado)
    })

    test('usa a paleta de ciclo quando recebe uma paleta desconhecida', async () => {
        await render(
            <PermissionItem
                titulo="Permissão desconhecida"
                ativo
                paleta="paleta-inexistente"
                aoAlterar={jest.fn()}
            />
        )

        expect(screen.getByRole('switch', {name: 'Permissão desconhecida'})).toHaveStyle(fundosAtivos.ciclo)
    })

    test('mantém as medidas definidas no protótipo', () => {
        expect(estilos.container).toEqual(
            expect.objectContaining({
                minHeight: 52,
                paddingLeft: 58,
                paddingRight: 16,
                paddingVertical: 6
            })
        )

        expect(estilos.titulo).toEqual(
            expect.objectContaining({
                fontSize: 15,
                lineHeight: 22
            })
        )
    })
})