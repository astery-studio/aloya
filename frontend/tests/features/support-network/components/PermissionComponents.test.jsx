//Cobre estados alternativos dos controles de permissões da Rede de Apoio.
import {fireEvent, render, screen} from '@testing-library/react-native'
import {View} from 'react-native'

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react')
    const {View: Icone} = require('react-native')

    const criarIcone = nome => function IconeFalso(propriedades) {
        return React.createElement(Icone, {
            ...propriedades,
            accessibilityLabel: nome
        })
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

import {GeneralPermissions} from '../../../../src/features/support-network/components/GeneralPermissions'
import PermissionCounter from '../../../../src/features/support-network/components/PermissionCounter'
import PermissionGroup from '../../../../src/features/support-network/components/PermissionGroup'
import {PermissionGroups} from '../../../../src/features/support-network/components/PermissionGroups'
import PermissionItem from '../../../../src/features/support-network/components/PermissionItem'
import SwitchField from '../../../../src/shared/components/forms/SwitchField/SwitchField'

const permissoes = [
    {id: 'ciclo.fluxo_menstrual', titulo: 'Fluxo menstrual'},
    {id: 'ciclo.sangramento_escape', titulo: 'Sangramento de escape'}
]

describe('componentes de permissões', () => {
    test('SwitchField alterna estados, usa rótulo seguro e bloqueia ação ausente', async () => {
        const aoAlterar = jest.fn()
        const {rerender} = await render(
            <SwitchField titulo="Permissão" aoAlterar={aoAlterar} />
        )

        await fireEvent.press(screen.getByRole('switch', {name: 'Permissão'}))
        expect(aoAlterar).toHaveBeenCalledWith(true)

        await rerender(
            <SwitchField titulo="Permissão" ativo aoAlterar={aoAlterar} />
        )
        await fireEvent.press(screen.getByRole('switch', {name: 'Permissão'}))
        expect(aoAlterar).toHaveBeenLastCalledWith(false)

        await rerender(<SwitchField />)
        expect(
            screen.getByRole('switch', {name: 'Interruptor de permissão'})
        ).toBeDisabled()

        await rerender(
            <SwitchField
                somenteControle
                rotuloAcessibilidade="Todas"
                aoAlterar={aoAlterar}
            />
        )
        expect(screen.getByRole('switch', {name: 'Todas'})).toBeEnabled()
    })

    test('GeneralPermissions trata seleção inválida, alteração e bloqueio', async () => {
        const aoAlterar = jest.fn()
        const {rerender} = await render(
            <GeneralPermissions
                permissoesSelecionadas="inválido"
                aoAlterar={aoAlterar}
            />
        )

        await fireEvent.press(
            screen.getByRole('switch', {name: 'Acesso à Fase Atual'})
        )
        expect(aoAlterar).toHaveBeenCalledWith('geral.fase_atual', true)

        await rerender(
            <GeneralPermissions
                permissoesSelecionadas={['geral.fase_atual']}
                aoAlterar={aoAlterar}
                desabilitado
            />
        )
        expect(
            screen.getByRole('switch', {name: 'Acesso à Fase Atual'})
        ).toBeDisabled()

        await rerender(<GeneralPermissions />)
        expect(
            screen.getByRole('switch', {name: 'Acesso aos Anticoncepcionais'})
        ).toBeDisabled()
    })

    test('PermissionCounter normaliza, limita e exibe quantidades válidas', async () => {
        const {rerender} = await render(
            <PermissionCounter quantidadeAtiva={9} total={2} />
        )
        expect(screen.getByLabelText('2 de 2 grupos ativos')).toBeOnTheScreen()

        await rerender(<PermissionCounter quantidadeAtiva={-1} total="6" />)
        expect(screen.getByLabelText('0 de 0 grupos ativos')).toBeOnTheScreen()
    })

    test('PermissionItem usa paleta alternativa e informa a alteração', async () => {
        const aoAlterar = jest.fn()
        const {rerender} = await render(
            <PermissionItem
                titulo="Item ativo"
                ativo
                paleta="desconhecida"
                aoAlterar={aoAlterar}
            />
        )

        await fireEvent.press(screen.getByRole('switch', {name: 'Item ativo'}))
        expect(aoAlterar).toHaveBeenCalledWith(false)

        await rerender(
            <PermissionItem titulo="Item inativo" aoAlterar={aoAlterar} />
        )
        await fireEvent.press(screen.getByRole('switch', {name: 'Item inativo'}))
        expect(aoAlterar).toHaveBeenLastCalledWith(true)
    })

    test('PermissionGroup expande, alterna item e grupo e mostra singular e plural', async () => {
        const aoAlterarPermissao = jest.fn()
        const aoAlterarGrupo = jest.fn()
        const {rerender} = await render(
            <PermissionGroup
                titulo="Ciclo"
                icone="pessoa"
                paleta="inexistente"
                permissoes={permissoes}
                permissoesSelecionadas={['ciclo.fluxo_menstrual']}
                aoAlterarPermissao={aoAlterarPermissao}
                aoAlterarGrupo={aoAlterarGrupo}
                inicialmenteExpandido
            />
        )

        expect(screen.getByText('1 permissão ativa')).toBeOnTheScreen()
        expect(screen.getByTestId('icone-grupo-pessoa')).toBeOnTheScreen()

        await fireEvent.press(screen.getByRole('switch', {name: 'Sangramento de escape'}))
        expect(aoAlterarPermissao).toHaveBeenCalledWith(
            'ciclo.sangramento_escape',
            true
        )

        await fireEvent.press(
            screen.getByRole('switch', {name: 'Ativar todas as permissões de Ciclo'})
        )
        expect(aoAlterarGrupo).toHaveBeenCalledWith(
            permissoes.map(permissao => permissao.id),
            true
        )

        await rerender(
            <PermissionGroup
                titulo="Ciclo"
                permissoes={permissoes}
                permissoesSelecionadas={permissoes.map(permissao => permissao.id)}
                aoAlterarPermissao={aoAlterarPermissao}
                aoAlterarGrupo={aoAlterarGrupo}
                inicialmenteExpandido
            />
        )
        expect(screen.getByText('2 permissões ativas')).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('switch', {name: 'Ativar todas as permissões de Ciclo'})
        )
        expect(aoAlterarGrupo).toHaveBeenLastCalledWith(
            permissoes.map(permissao => permissao.id),
            false
        )

        await fireEvent.press(screen.getByRole('button', {name: 'Ciclo'}))
        expect(screen.queryByText('Fluxo menstrual')).toBeNull()
    })

    test('PermissionGroup filtra valores inválidos e cobre todos os ícones', async () => {
        await render(
            <View>
                {[
                    ['gota', 'Gota'],
                    ['coracao', 'Coração'],
                    ['raio', 'Energia'],
                    ['pessoas', 'Pessoas'],
                    ['primeirosSocorros', 'Saúde'],
                    ['desconhecido', 'Padrão']
                ].map(([icone, titulo]) => (
                    <PermissionGroup
                        key={titulo}
                        titulo={titulo}
                        icone={icone}
                        permissoes={[null, {}, {id: 1, titulo: 'Inválida'}]}
                        permissoesSelecionadas="inválido"
                    />
                ))}
            </View>
        )

        expect(screen.getByTestId('icone-grupo-coracao')).toBeOnTheScreen()
        expect(screen.getByTestId('icone-grupo-raio')).toBeOnTheScreen()
        expect(screen.getByTestId('icone-grupo-pessoas')).toBeOnTheScreen()
        expect(screen.getByTestId('icone-grupo-primeirosSocorros')).toBeOnTheScreen()
        expect(screen.getByTestId('icone-grupo-desconhecido')).toBeOnTheScreen()
        expect(
            screen.getByRole('switch', {name: 'Ativar todas as permissões de Gota'})
        ).toBeDisabled()
    })

    test('PermissionGroups normaliza e altera seleções individuais e completas', async () => {
        const aoAlterar = jest.fn()
        const {rerender} = await render(
            <PermissionGroups
                permissoesSelecionadas={[
                    'geral.fase_atual',
                    'geral.fase_atual',
                    'inválida',
                    10
                ]}
                aoAlterar={aoAlterar}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {name: 'Ciclo e Sangramento'})
        )
        await fireEvent.press(
            screen.getByRole('switch', {name: 'Fluxo menstrual'})
        )
        expect(aoAlterar).toHaveBeenCalledWith([
            'geral.fase_atual',
            'ciclo.fluxo_menstrual'
        ])

        await fireEvent.press(
            screen.getByRole('switch', {
                name: 'Ativar todas as permissões de Ciclo e Sangramento'
            })
        )
        expect(aoAlterar).toHaveBeenLastCalledWith(expect.arrayContaining([
            'geral.fase_atual',
            'ciclo.fluxo_menstrual',
            'ciclo.sangramento_escape'
        ]))

        await rerender(<PermissionGroups permissoesSelecionadas={null} />)
        expect(
            screen.getByRole('switch', {
                name: 'Ativar todas as permissões de Ciclo e Sangramento'
            })
        ).toBeDisabled()
    })
})
