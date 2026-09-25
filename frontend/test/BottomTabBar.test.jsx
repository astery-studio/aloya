import {fireEvent, render, screen} from '@testing-library/react-native'

jest.mock(
    'phosphor-react-native/src/icons/Users',
    () => ({
        UsersIcon: jest.fn(() => null)
    })
)

jest.mock(
    'phosphor-react-native/src/icons/ArrowsClockwise',
    () => ({
        ArrowsClockwiseIcon: jest.fn(() => null)
    })
)

jest.mock(
    'phosphor-react-native/src/icons/House',
    () => ({
        HouseIcon: jest.fn(() => null)
    })
)

jest.mock(
    'phosphor-react-native/src/icons/CalendarBlank',
    () => ({
        CalendarBlankIcon: jest.fn(() => null)
    })
)

jest.mock(
    'phosphor-react-native/src/icons/Gear',
    () => ({
        GearIcon: jest.fn(() => null)
    })
)

import {UsersIcon} from 'phosphor-react-native/src/icons/Users'
import {ArrowsClockwiseIcon} from 'phosphor-react-native/src/icons/ArrowsClockwise'
import {HouseIcon} from 'phosphor-react-native/src/icons/House'
import {CalendarBlankIcon} from 'phosphor-react-native/src/icons/CalendarBlank'
import {GearIcon} from 'phosphor-react-native/src/icons/Gear'
import {estilos} from '../components/navigation/BottomTab/BottomTabBar/BottomTabBar.style'
import {BottomTabBar} from '../components/navigation/BottomTab/BottomTabBar/BottomTabBar'

describe('BottomTabBar', () => {
    beforeEach(() => {
        UsersIcon.mockClear()
        ArrowsClockwiseIcon.mockClear()
        HouseIcon.mockClear()
        CalendarBlankIcon.mockClear()
        GearIcon.mockClear()
    })

    test('renderiza as cinco abas na ordem correta', async () => {
        await render(
            <BottomTabBar
                abaAtiva="inicio"
                onSelecionar={jest.fn()}
            />
        )

        const abas =
            screen.getAllByRole('tab')

        expect(abas).toHaveLength(5)

        expect(abas[0]).toHaveAccessibleName(
            'Membros'
        )

        expect(abas[1]).toHaveAccessibleName(
            'Ciclos'
        )

        expect(abas[2]).toHaveAccessibleName(
            'Início'
        )

        expect(abas[3]).toHaveAccessibleName(
            'Diário'
        )

        expect(abas[4]).toHaveAccessibleName(
            'Config.'
        )
    })

    test('renderiza o ícone correspondente a cada aba', async () => {
        await render(
            <BottomTabBar
                abaAtiva="inicio"
                onSelecionar={jest.fn()}
            />
        )

        expect(UsersIcon).toHaveBeenCalledTimes(1)

        expect(
            ArrowsClockwiseIcon
        ).toHaveBeenCalledTimes(1)

        expect(HouseIcon).toHaveBeenCalledTimes(1)

        expect(
            CalendarBlankIcon
        ).toHaveBeenCalledTimes(1)

        expect(GearIcon).toHaveBeenCalledTimes(1)
    })

    test('marca somente a aba informada como ativa', async () => {
        await render(
            <BottomTabBar
                abaAtiva="inicio"
                onSelecionar={jest.fn()}
            />
        )

        expect(
            screen.getByRole(
                'tab',
                {
                    name: 'Membros'
                }
            )
        ).not.toBeSelected()

        expect(
            screen.getByRole(
                'tab',
                {
                    name: 'Ciclos'
                }
            )
        ).not.toBeSelected()

        expect(
            screen.getByRole(
                'tab',
                {
                    name: 'Início'
                }
            )
        ).toBeSelected()

        expect(
            screen.getByRole(
                'tab',
                {
                    name: 'Diário'
                }
            )
        ).not.toBeSelected()

        expect(
            screen.getByRole(
                'tab',
                {
                    name: 'Config.'
                }
            )
        ).not.toBeSelected()
    })

    test('não seleciona nenhuma aba quando o id é desconhecido', async () => {
        await render(
            <BottomTabBar
                abaAtiva="abaInexistente"
                onSelecionar={jest.fn()}
            />
        )

        const abas =
            screen.getAllByRole('tab')

        for (const aba of abas) {
            expect(aba).not.toBeSelected()
        }
    })

    test.each([
        [
            'Membros',
            'membros'
        ],
        [
            'Ciclos',
            'ciclos'
        ],
        [
            'Início',
            'inicio'
        ],
        [
            'Diário',
            'diario'
        ],
        [
            'Config.',
            'configuracoes'
        ]
    ])(
        'envia o id %s ao selecionar a aba',
        async (label, idEsperado) => {
            const onSelecionar = jest.fn()

            await render(
                <BottomTabBar
                    abaAtiva="inicio"
                    onSelecionar={onSelecionar}
                />
            )

            await fireEvent.press(
                screen.getByRole(
                    'tab',
                    {
                        name: label
                    }
                )
            )

            expect(
                onSelecionar
            ).toHaveBeenCalledTimes(1)

            expect(
                onSelecionar
            ).toHaveBeenCalledWith(
                idEsperado
            )
        }
    )

    test('desabilita todas as abas quando não recebe onSelecionar', async () => {
        await render(
            <BottomTabBar
                abaAtiva="inicio"
            />
        )

        const abas =
            screen.getAllByRole('tab')

        expect(abas).toHaveLength(5)

        for (const aba of abas) {
            expect(aba).toBeDisabled()
        }
    })

    test('altera a seleção quando abaAtiva muda', async () => {
        const resultado =
            await render(
                <BottomTabBar
                    abaAtiva="inicio"
                    onSelecionar={jest.fn()}
                />
            )

        expect(
            screen.getByRole(
                'tab',
                {
                    name: 'Início'
                }
            )
        ).toBeSelected()

        await resultado.rerender(
            <BottomTabBar
                abaAtiva="diario"
                onSelecionar={jest.fn()}
            />
        )

        expect(
            screen.getByRole(
                'tab',
                {
                    name: 'Início'
                }
            )
        ).not.toBeSelected()

        expect(
            screen.getByRole(
                'tab',
                {
                    name: 'Diário'
                }
            )
        ).toBeSelected()
    })

    test('renderiza somente uma barra com o estilo correto', async () => {
        const resultado =
            await render(
                <BottomTabBar
                    abaAtiva="inicio"
                    onSelecionar={jest.fn()}
                />
            )

        const barras =
            resultado.container.queryAll(
                (elemento) =>
                    elemento.props.style
                    === estilos.barra
            )

        expect(barras).toHaveLength(1)
    })
})