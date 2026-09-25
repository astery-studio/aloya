//Testa a exibição, a acessibilidade e a proteção dos valores do PermissionCounter.
import {render, screen} from '@testing-library/react-native'

import PermissionCounter from '../../features/support-network/components/PermissionCounter'
import {estilos} from '../../features/support-network/components/PermissionCounter.styles'

describe('PermissionCounter', () => {
    test('mostra a quantidade de grupos ativos', async () => {
        await render(
            <PermissionCounter
                quantidadeAtiva={2}
                total={6}
            />
        )

        expect(screen.getByText('2 / 6 ativos')).toBeOnTheScreen()
        expect(screen.getByLabelText('2 de 6 grupos ativos')).toBeOnTheScreen()
    })

    test('mostra zero quando nenhum grupo está ativo', async () => {
        await render(
            <PermissionCounter
                quantidadeAtiva={0}
                total={6}
            />
        )

        expect(screen.getByText('0 / 6 ativos')).toBeOnTheScreen()
    })

    test('não permite uma quantidade ativa maior que o total', async () => {
        await render(
            <PermissionCounter
                quantidadeAtiva={10}
                total={6}
            />
        )

        expect(screen.getByText('6 / 6 ativos')).toBeOnTheScreen()
    })

    test('transforma números negativos em zero', async () => {
        await render(
            <PermissionCounter
                quantidadeAtiva={-2}
                total={6}
            />
        )

        expect(screen.getByText('0 / 6 ativos')).toBeOnTheScreen()
    })

    test('trata valores inválidos sem quebrar o componente', async () => {
        await render(
            <PermissionCounter
                quantidadeAtiva="dois"
                total="seis"
            />
        )

        expect(screen.getByText('0 / 0 ativos')).toBeOnTheScreen()
    })

    test('começa em zero quando não recebe propriedades', async () => {
        await render(<PermissionCounter />)

        expect(screen.getByText('0 / 0 ativos')).toBeOnTheScreen()
    })

    test('mantém as medidas definidas no protótipo', () => {
        expect(estilos.container).toEqual(
            expect.objectContaining({
                minWidth: 85,
                height: 26,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999
            })
        )

        expect(estilos.texto).toEqual(
            expect.objectContaining({
                fontSize: 12,
                lineHeight: 18
            })
        )
    })
})