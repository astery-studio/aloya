import { Text } from 'react-native'
import { render, screen } from '@testing-library/react-native'

jest.mock(
    '../components/navigation/Header/Header',
    () => ({
        Header: jest.fn(() => null)
    })
)

jest.mock(
    '../components/navigation/BottomTab/BottomTabBar/BottomTabBar',
    () => ({
        BottomTabBar: jest.fn(() => null)
    })
)

import { Header } from '../../components/navigation/Header/Header'
import { BottomTabBar } from '../../components/navigation/BottomTab/BottomTabBar/BottomTabBar'
import { estilos } from '../../layouts/MainLayout/MainLayout.style'
import { MainLayout } from '../../layouts/MainLayout/MainLayout'

describe('MainLayout', () => {
    beforeEach(() => {
        Header.mockClear()
        BottomTabBar.mockClear()
    })

    test('renderiza o conteúdo recebido', async () => {
        await render(
            <MainLayout
                titulo="Configurações"
                abaAtiva="configuracoes"
                onSelecionarAba={jest.fn()}
            >
                <Text>
                    Conteúdo da screen
                </Text>
            </MainLayout>
        )

        expect(
            screen.getByText('Conteúdo da screen')
        ).toBeOnTheScreen()
    })

    test('envia os dados corretos para o Header', async () => {
        const onVoltar = jest.fn()

        await render(
            <MainLayout
                titulo="Configurações de Perfil"
                varianteHeader="comVoltar"
                onVoltar={onVoltar}
                abaAtiva="configuracoes"
                onSelecionarAba={jest.fn()}
            >
                <Text>Conteúdo</Text>
            </MainLayout>
        )

        const propriedadesHeader =
            Header.mock.calls[0][0]

        expect(propriedadesHeader.titulo).toBe(
            'Configurações de Perfil'
        )

        expect(propriedadesHeader.variante).toBe(
            'comVoltar'
        )

        expect(propriedadesHeader.onVoltar).toBe(
            onVoltar
        )
    })

    test('envia os dados corretos para a navegação inferior', async () => {
        const onSelecionarAba = jest.fn()

        await render(
            <MainLayout
                titulo="Configurações"
                abaAtiva="configuracoes"
                onSelecionarAba={onSelecionarAba}
            >
                <Text>Conteúdo</Text>
            </MainLayout>
        )

        const propriedadesNavegacao =
            BottomTabBar.mock.calls[0][0]

        expect(propriedadesNavegacao.abaAtiva).toBe(
            'configuracoes'
        )

        expect(
            propriedadesNavegacao.onSelecionar
        ).toBe(onSelecionarAba)
    })

    test('usa os estilos estruturais do layout', async () => {
        await render(
            <MainLayout
                titulo="Configurações"
                abaAtiva="configuracoes"
                onSelecionarAba={jest.fn()}
            >
                <Text>Conteúdo</Text>
            </MainLayout>
        )

        expect(
            screen.getByTestId('main-layout')
        ).toHaveStyle(estilos.container)

        expect(
            screen.getByTestId(
                'conteudo-main-layout'
            )
        ).toHaveStyle(estilos.conteudo)
    })
})