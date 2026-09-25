//Testa a exibição e o controle das permissões gerais.
import {Animated} from 'react-native'
import {fireEvent, render, screen} from '@testing-library/react-native'

import {GeneralPermissions} from '../../features/support-network/components/GeneralPermissions'
import {permissoesGerais} from '../../features/support-network/constants/permissionOptions'

describe('GeneralPermissions', () => {
    beforeEach(() => {
        jest.spyOn(Animated, 'timing').mockReturnValue({
            start: jest.fn(),
            stop: jest.fn()
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('mostra o título e as cinco permissões gerais', async () => {
        await render(
            <GeneralPermissions aoAlterar={jest.fn()} />
        )

        expect(screen.getByRole('header', {name: 'Permissões Gerais'})).toBeOnTheScreen()

        for (const permissao of permissoesGerais) {
            expect(
                screen.getByRole('switch', {
                    name: permissao.titulo
                })
            ).toBeOnTheScreen()
        }
    })

    test('marca somente as permissões recebidas como ativas', async () => {
        await render(
            <GeneralPermissions
                permissoesSelecionadas={[
                    'geral.fase_atual',
                    'geral.dicas'
                ]}
                aoAlterar={jest.fn()}
            />
        )

        expect(
            screen.getByRole('switch', {
                name: 'Acesso à Fase Atual'
            })
        ).toHaveProp('accessibilityState', {
            checked: true,
            disabled: false
        })

        expect(
            screen.getByRole('switch', {
                name: 'Receber dicas'
            })
        ).toHaveProp('accessibilityState', {
            checked: true,
            disabled: false
        })

        expect(
            screen.getByRole('switch', {
                name: 'Acesso aos Anticoncepcionais'
            })
        ).toHaveProp('accessibilityState', {
            checked: false,
            disabled: false
        })
    })

    test('informa o identificador e o novo estado da permissão', async () => {
        const aoAlterar = jest.fn()

        await render(
            <GeneralPermissions aoAlterar={aoAlterar} />
        )

        await fireEvent.press(
            screen.getByRole('switch', {
                name: 'Acesso à Fase Atual'
            })
        )

        expect(aoAlterar).toHaveBeenCalledTimes(1)

        expect(aoAlterar).toHaveBeenCalledWith(
            'geral.fase_atual',
            true
        )
    })

    test('informa a desativação de uma permissão ligada', async () => {
        const aoAlterar = jest.fn()

        await render(
            <GeneralPermissions
                permissoesSelecionadas={['geral.dicas']}
                aoAlterar={aoAlterar}
            />
        )

        await fireEvent.press(
            screen.getByRole('switch', {
                name: 'Receber dicas'
            })
        )

        expect(aoAlterar).toHaveBeenCalledWith(
            'geral.dicas',
            false
        )
    })

    test('desabilita todos os interruptores durante o carregamento', async () => {
        await render(
            <GeneralPermissions
                desabilitado
                aoAlterar={jest.fn()}
            />
        )

        for (const permissao of permissoesGerais) {
            expect(
                screen.getByRole('switch', {
                    name: permissao.titulo
                })
            ).toBeDisabled()
        }
    })

    test('fica desabilitado quando não recebe uma ação', async () => {
        await render(
            <GeneralPermissions />
        )

        for (const permissao of permissoesGerais) {
            expect(
                screen.getByRole('switch', {
                    name: permissao.titulo
                })
            ).toBeDisabled()
        }
    })

    test('ignora identificadores desconhecidos recebidos como ativos', async () => {
        await render(
            <GeneralPermissions
                permissoesSelecionadas={['administrador.acesso_total']}
                aoAlterar={jest.fn()}
            />
        )

        for (const permissao of permissoesGerais) {
            expect(
                screen.getByRole('switch', {
                    name: permissao.titulo
                })
            ).toHaveProp('accessibilityState', {
                checked: false,
                disabled: false
            })
        }
    })
})