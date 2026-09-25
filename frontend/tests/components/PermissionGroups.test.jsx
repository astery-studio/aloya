//Testa a listagem, o contador e as alterações individuais e coletivas do PermissionGroups.
import {Animated} from 'react-native'
import {fireEvent, render, screen} from '@testing-library/react-native'

jest.mock('../../components/icons/AppIcons', () => {
    const React = require('react')
    const {View} = require('react-native')

    const criarIcone = nome => function IconeFalso({testID}) {
        return React.createElement(View, {testID, accessibilityLabel: nome})
    }

    return {
        CaretDownIcon: criarIcone('CaretDownIcon'),
        CaretUpIcon: criarIcone('CaretUpIcon'),
        DropIcon: criarIcone('DropIcon'),
        FirstAidKitIcon: criarIcone('FirstAidKitIcon'),
        HeartIcon: criarIcone('HeartIcon'),
        LightningIcon: criarIcone('LightningIcon'),
        PersonArmsSpreadIcon: criarIcone('PersonArmsSpreadIcon'),
        UsersIcon: criarIcone('UsersIcon')
    }
})

import {PermissionGroups} from '../../features/support-network/components/PermissionGroups'
import {estilos} from '../../features/support-network/components/PermissionGroups.styles'

describe('PermissionGroups', () => {
    beforeEach(() => {
        jest.spyOn(Animated, 'timing').mockReturnValue({
            start: jest.fn(),
            stop: jest.fn()
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('mostra os seis grupos e o contador vazio', async () => {
        await render(<PermissionGroups aoAlterar={jest.fn()} />)

        expect(screen.getByRole('header', {name: 'Permissões de Acesso'})).toBeOnTheScreen()
        expect(screen.getByText('0 / 6 ativos')).toBeOnTheScreen()
        expect(screen.getByText('Ciclo e Sangramento')).toBeOnTheScreen()
        expect(screen.getByText('Corpo e Sintomas Físicos')).toBeOnTheScreen()
        expect(screen.getByText('Emocional')).toBeOnTheScreen()
        expect(screen.getByText('Energia e Sono')).toBeOnTheScreen()
        expect(screen.getByText('Vida Íntima e Social')).toBeOnTheScreen()
        expect(screen.getByText('Saúde e Acompanhamento')).toBeOnTheScreen()
    })

    test('conta grupos que possuem ao menos uma permissão ativa', async () => {
        await render(
            <PermissionGroups
                permissoesSelecionadas={[
                    'ciclo.fluxo_menstrual',
                    'ciclo.sangramento_escape',
                    'energia.qualidade_sono'
                ]}
                aoAlterar={jest.fn()}
            />
        )

        expect(screen.getByText('2 / 6 ativos')).toBeOnTheScreen()
    })

    test('adiciona uma permissão individual sem apagar permissões gerais', async () => {
        const aoAlterar = jest.fn()

        await render(
            <PermissionGroups
                permissoesSelecionadas={['geral.fase_atual']}
                aoAlterar={aoAlterar}
            />
        )

        await fireEvent.press(screen.getByRole('button', {name: 'Ciclo e Sangramento'}))
        const item = await screen.findByRole('switch', {name: 'Fluxo menstrual'})

        await fireEvent.press(item)

        expect(aoAlterar).toHaveBeenCalledWith([
            'geral.fase_atual',
            'ciclo.fluxo_menstrual'
        ])
    })

    test('remove uma permissão individual sem apagar as demais', async () => {
        const aoAlterar = jest.fn()

        await render(
            <PermissionGroups
                permissoesSelecionadas={[
                    'geral.fase_atual',
                    'ciclo.fluxo_menstrual',
                    'energia.energia'
                ]}
                aoAlterar={aoAlterar}
            />
        )

        await fireEvent.press(screen.getByRole('button', {name: 'Ciclo e Sangramento'}))
        const item = await screen.findByRole('switch', {name: 'Fluxo menstrual'})

        await fireEvent.press(item)

        expect(aoAlterar).toHaveBeenCalledWith([
            'geral.fase_atual',
            'energia.energia'
        ])
    })

    test('ativa um grupo inteiro usando uma única atualização', async () => {
        const aoAlterar = jest.fn()

        await render(
            <PermissionGroups
                permissoesSelecionadas={['geral.dicas']}
                aoAlterar={aoAlterar}
            />
        )

        await fireEvent.press(
            screen.getByRole('switch', {
                name: 'Ativar todas as permissões de Ciclo e Sangramento'
            })
        )

        expect(aoAlterar).toHaveBeenCalledTimes(1)
        expect(aoAlterar).toHaveBeenCalledWith([
            'geral.dicas',
            'ciclo.fluxo_menstrual',
            'ciclo.sangramento_escape',
            'ciclo.secrecao_corrimento'
        ])
    })

    test('desativa um grupo inteiro sem apagar permissões de outros grupos', async () => {
        const aoAlterar = jest.fn()

        await render(
            <PermissionGroups
                permissoesSelecionadas={[
                    'geral.dicas',
                    'ciclo.fluxo_menstrual',
                    'ciclo.sangramento_escape',
                    'ciclo.secrecao_corrimento',
                    'energia.energia'
                ]}
                aoAlterar={aoAlterar}
            />
        )

        await fireEvent.press(
            screen.getByRole('switch', {
                name: 'Ativar todas as permissões de Ciclo e Sangramento'
            })
        )

        expect(aoAlterar).toHaveBeenCalledTimes(1)
        expect(aoAlterar).toHaveBeenCalledWith([
            'geral.dicas',
            'energia.energia'
        ])
    })

    test('remove identificadores desconhecidos antes de devolver a lista', async () => {
        const aoAlterar = jest.fn()

        await render(
            <PermissionGroups
                permissoesSelecionadas={[
                    'permissao.inexistente',
                    'geral.fase_atual'
                ]}
                aoAlterar={aoAlterar}
            />
        )

        await fireEvent.press(
            screen.getByRole('switch', {
                name: 'Ativar todas as permissões de Ciclo e Sangramento'
            })
        )

        expect(aoAlterar).toHaveBeenCalledWith([
            'geral.fase_atual',
            'ciclo.fluxo_menstrual',
            'ciclo.sangramento_escape',
            'ciclo.secrecao_corrimento'
        ])
    })

    test('remove permissões repetidas antes de atualizar', async () => {
        const aoAlterar = jest.fn()

        await render(
            <PermissionGroups
                permissoesSelecionadas={[
                    'geral.dicas',
                    'geral.dicas'
                ]}
                aoAlterar={aoAlterar}
            />
        )

        await fireEvent.press(
            screen.getByRole('switch', {
                name: 'Ativar todas as permissões de Ciclo e Sangramento'
            })
        )

        expect(aoAlterar).toHaveBeenCalledWith([
            'geral.dicas',
            'ciclo.fluxo_menstrual',
            'ciclo.sangramento_escape',
            'ciclo.secrecao_corrimento'
        ])
    })

    test('bloqueia todos os interruptores quando está desabilitado', async () => {
        const aoAlterar = jest.fn()

        await render(
            <PermissionGroups
                desabilitado
                aoAlterar={aoAlterar}
            />
        )

        const interruptor = screen.getByRole('switch', {
            name: 'Ativar todas as permissões de Ciclo e Sangramento'
        })

        expect(interruptor).toBeDisabled()

        await fireEvent.press(interruptor)

        expect(aoAlterar).not.toHaveBeenCalled()
    })

    test('fica desabilitado quando não recebe função de alteração', async () => {
        await render(<PermissionGroups />)

        expect(
            screen.getByRole('switch', {
                name: 'Ativar todas as permissões de Ciclo e Sangramento'
            })
        ).toBeDisabled()
    })

    test('trata uma lista inválida como vazia', async () => {
        await render(
            <PermissionGroups
                permissoesSelecionadas={null}
                aoAlterar={jest.fn()}
            />
        )

        expect(screen.getByText('0 / 6 ativos')).toBeOnTheScreen()
    })

    test('mantém o espaçamento definido no protótipo', () => {
        expect(estilos.cabecalho).toEqual(
            expect.objectContaining({
                minHeight: 42,
                paddingBottom: 16
            })
        )

        expect(estilos.lista).toEqual(
            expect.objectContaining({
                gap: 10
            })
        )
    })
})