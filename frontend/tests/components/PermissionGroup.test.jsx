//Testa expansão, contagem, ícones e alterações individuais e coletivas do PermissionGroup.
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

import PermissionGroup from '../../features/support-network/components/PermissionGroup'

const permissoes = [
    {
        id: 'ciclo.fluxo_menstrual',
        titulo: 'Fluxo menstrual'
    },
    {
        id: 'ciclo.sangramento_escape',
        titulo: 'Sangramento de escape'
    },
    {
        id: 'ciclo.secrecao_corrimento',
        titulo: 'Secreção/corrimento'
    }
]

describe('PermissionGroup', () => {
    beforeEach(() => {
        jest.spyOn(Animated, 'timing').mockReturnValue({
            start: jest.fn(),
            stop: jest.fn()
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('começa recolhido por padrão', async () => {
        await render(
            <PermissionGroup
                titulo="Ciclo e Sangramento"
                permissoes={permissoes}
                aoAlterarPermissao={jest.fn()}
                aoAlterarGrupo={jest.fn()}
            />
        )

        const cabecalho = screen.getByRole('button', {name: 'Ciclo e Sangramento'})

        expect(cabecalho).toHaveProp('accessibilityState', {expanded: false})
        expect(screen.queryByText('Fluxo menstrual')).toBeNull()
    })

    test('expande e recolhe a lista pelo cabeçalho', async () => {
        await render(
            <PermissionGroup
                titulo="Ciclo e Sangramento"
                permissoes={permissoes}
                aoAlterarPermissao={jest.fn()}
                aoAlterarGrupo={jest.fn()}
            />
        )

        let cabecalho = screen.getByRole('button', {name: 'Ciclo e Sangramento'})

        fireEvent.press(cabecalho)

        cabecalho = screen.getByRole('button', {name: 'Ciclo e Sangramento'})

        expect(cabecalho).toHaveProp('accessibilityState', expect.objectContaining({expanded: true}))
        expect(screen.getByText('Fluxo menstrual')).toBeOnTheScreen()
        expect(screen.getByText('Sangramento de escape')).toBeOnTheScreen()
        expect(screen.getByText('Secreção/corrimento')).toBeOnTheScreen()

        fireEvent.press(cabecalho)

        cabecalho = screen.getByRole('button', {name: 'Ciclo e Sangramento'})

        expect(cabecalho).toHaveProp('accessibilityState', expect.objectContaining({expanded: false}))
        expect(screen.queryByText('Fluxo menstrual')).toBeNull()
    })

    test('pode começar expandido', async () => {
        await render(
            <PermissionGroup
                titulo="Ciclo e Sangramento"
                permissoes={permissoes}
                inicialmenteExpandido
                aoAlterarPermissao={jest.fn()}
                aoAlterarGrupo={jest.fn()}
            />
        )

        expect(screen.getByText('Fluxo menstrual')).toBeOnTheScreen()
    })

    test('mostra a quantidade de permissões ativas', async () => {
        await render(
            <PermissionGroup
                titulo="Ciclo e Sangramento"
                permissoes={permissoes}
                permissoesSelecionadas={['ciclo.fluxo_menstrual', 'ciclo.sangramento_escape']}
                aoAlterarPermissao={jest.fn()}
                aoAlterarGrupo={jest.fn()}
            />
        )

        expect(screen.getByText('2 permissões ativas')).toBeOnTheScreen()
    })

    test('usa o singular quando existe somente uma permissão ativa', async () => {
        await render(
            <PermissionGroup
                titulo="Ciclo e Sangramento"
                permissoes={permissoes}
                permissoesSelecionadas={['ciclo.fluxo_menstrual']}
                aoAlterarPermissao={jest.fn()}
                aoAlterarGrupo={jest.fn()}
            />
        )

        expect(screen.getByText('1 permissão ativa')).toBeOnTheScreen()
    })

    test('informa a alteração de uma permissão individual', async () => {
        const aoAlterarPermissao = jest.fn()

        await render(
            <PermissionGroup
                titulo="Ciclo e Sangramento"
                permissoes={permissoes}
                inicialmenteExpandido
                aoAlterarPermissao={aoAlterarPermissao}
                aoAlterarGrupo={jest.fn()}
            />
        )

        fireEvent.press(screen.getByRole('switch', {name: 'Fluxo menstrual'}))

        expect(aoAlterarPermissao).toHaveBeenCalledWith('ciclo.fluxo_menstrual', true)
    })

    test('solicita a ativação de todas as permissões', async () => {
        const aoAlterarGrupo = jest.fn()

        await render(
            <PermissionGroup
                titulo="Ciclo e Sangramento"
                permissoes={permissoes}
                aoAlterarPermissao={jest.fn()}
                aoAlterarGrupo={aoAlterarGrupo}
            />
        )

        fireEvent.press(screen.getByRole('switch', {name: 'Ativar todas as permissões de Ciclo e Sangramento'}))

        expect(aoAlterarGrupo).toHaveBeenCalledWith(
            [
                'ciclo.fluxo_menstrual',
                'ciclo.sangramento_escape',
                'ciclo.secrecao_corrimento'
            ],
            true
        )
    })

    test('solicita a desativação quando todas estão ligadas', async () => {
        const aoAlterarGrupo = jest.fn()
        const todasSelecionadas = permissoes.map(permissao => permissao.id)

        await render(
            <PermissionGroup
                titulo="Ciclo e Sangramento"
                permissoes={permissoes}
                permissoesSelecionadas={todasSelecionadas}
                aoAlterarPermissao={jest.fn()}
                aoAlterarGrupo={aoAlterarGrupo}
            />
        )

        const interruptor = screen.getByRole('switch', {name: 'Ativar todas as permissões de Ciclo e Sangramento'})

        expect(interruptor).toHaveProp('accessibilityState', {checked: true, disabled: false})

        fireEvent.press(interruptor)

        expect(aoAlterarGrupo).toHaveBeenCalledWith(todasSelecionadas, false)
    })

    test('bloqueia alterações quando está desabilitado', async () => {
        const aoAlterarPermissao = jest.fn()
        const aoAlterarGrupo = jest.fn()

        await render(
            <PermissionGroup
                titulo="Ciclo e Sangramento"
                permissoes={permissoes}
                inicialmenteExpandido
                desabilitado
                aoAlterarPermissao={aoAlterarPermissao}
                aoAlterarGrupo={aoAlterarGrupo}
            />
        )

        const interruptorDoGrupo = screen.getByRole('switch', {name: 'Ativar todas as permissões de Ciclo e Sangramento'})
        const interruptorDoItem = screen.getByRole('switch', {name: 'Fluxo menstrual'})

        expect(interruptorDoGrupo).toBeDisabled()
        expect(interruptorDoItem).toBeDisabled()

        fireEvent.press(interruptorDoGrupo)
        fireEvent.press(interruptorDoItem)

        expect(aoAlterarGrupo).not.toHaveBeenCalled()
        expect(aoAlterarPermissao).not.toHaveBeenCalled()
    })

    test('trata listas inválidas sem quebrar o componente', async () => {
        await render(
            <PermissionGroup
                titulo="Grupo vazio"
                permissoes={null}
                permissoesSelecionadas={null}
                aoAlterarPermissao={jest.fn()}
                aoAlterarGrupo={jest.fn()}
            />
        )

        expect(screen.getByRole('switch', {name: 'Ativar todas as permissões de Grupo vazio'})).toBeDisabled()
    })

    test.each([
        ['gota', 'ciclo'],
        ['pessoa', 'corpo'],
        ['coracao', 'emocional'],
        ['raio', 'energia'],
        ['pessoas', 'vidaIntima'],
        ['primeirosSocorros', 'saude']
    ])('mostra o ícone %s com a paleta %s', async (icone, paleta) => {
        await render(
            <PermissionGroup
                titulo={`Grupo ${paleta}`}
                icone={icone}
                paleta={paleta}
                permissoes={permissoes}
                aoAlterarPermissao={jest.fn()}
                aoAlterarGrupo={jest.fn()}
            />
        )

        expect(screen.getByTestId(`icone-grupo-${icone}`)).toBeOnTheScreen()
    })
})