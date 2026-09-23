//Confere o conteúdo, o cabeçalho, a rolagem e o rodapé opcional do SettingsLayout.
import { Text } from 'react-native'
import { render, screen, within } from '@testing-library/react-native'

jest.mock('../components/navigation/Header/Header', () => ({
    Header: jest.fn(() => null)
}))

import { Header } from '../components/navigation/Header/Header'
import { SettingsLayout } from '../layouts/SettingsLayout/SettingsLayout'
import { estilos } from '../layouts/SettingsLayout/SettingsLayout.style'

describe('SettingsLayout', () => {
    beforeEach(() => {
        Header.mockClear()
    })

    test('renderiza o conteúdo recebido', async () => {
        await render(
            <SettingsLayout titulo="Configurações de Perfil" onVoltar={jest.fn()}>
                <Text>Dados pessoais</Text>
            </SettingsLayout>
        )

        expect(screen.getByText('Dados pessoais')).toBeOnTheScreen()
    })

    test('mantém o rodapé dentro da área de rolagem', async () => {
        await render(
            <SettingsLayout
                titulo="Configurações de Perfil"
                onVoltar={jest.fn()}
                rodape={<Text>Ações da conta</Text>}
            >
                <Text>Conteúdo do perfil</Text>
            </SettingsLayout>
        )

        const areaDeRolagem = screen.getByTestId('rolagem-settings-layout')
        const rodape = within(areaDeRolagem).getByTestId('rodape-settings-layout')

        expect(rodape).toBeOnTheScreen()
        expect(rodape).toHaveStyle(estilos.rodape)
    })

    test('usa o cabeçalho com botão de voltar', async () => {
        const onVoltar = jest.fn()

        await render(
            <SettingsLayout titulo="Alterar Senha" onVoltar={onVoltar}>
                <Text>Formulário</Text>
            </SettingsLayout>
        )

        expect(Header).toHaveBeenCalledTimes(1)
        expect(Header.mock.calls[0][0]).toEqual(expect.objectContaining({
            titulo: 'Alterar Senha',
            variante: 'comVoltar',
            onVoltar
        }))
    })

    test('renderiza o rodapé quando ele é informado', async () => {
        await render(
            <SettingsLayout titulo="Configurações de Perfil" onVoltar={jest.fn()} rodape={<Text>Sair</Text>}>
                <Text>Dados pessoais</Text>
            </SettingsLayout>
        )

        expect(screen.getByTestId('rodape-settings-layout')).toBeOnTheScreen()
        expect(screen.getByText('Sair')).toBeOnTheScreen()
    })

    test('não cria espaço de rodapé quando ele não é informado', async () => {
        await render(
            <SettingsLayout titulo="Alterar Senha" onVoltar={jest.fn()}>
                <Text>Formulário</Text>
            </SettingsLayout>
        )

        expect(screen.queryByTestId('rodape-settings-layout')).toBeNull()
    })

    test('permite personalizar o identificador usado nos testes', async () => {
        await render(
            <SettingsLayout titulo="Configurações" onVoltar={jest.fn()} testeId="layout-personalizado">
                <Text>Conteúdo</Text>
            </SettingsLayout>
        )

        expect(screen.getByTestId('layout-personalizado')).toHaveStyle(estilos.container)
    })

    test('configura a rolagem para formulários e teclados', async () => {
        await render(
            <SettingsLayout titulo="Alterar Senha" onVoltar={jest.fn()}>
                <Text>Formulário</Text>
            </SettingsLayout>
        )

        const rolagem = screen.getByTestId('rolagem-settings-layout')

        expect(rolagem.props.contentContainerStyle).toEqual(estilos.conteudo)
        expect(rolagem.props.keyboardShouldPersistTaps).toBe('handled')
        expect(rolagem.props.showsVerticalScrollIndicator).toBe(false)
    })
})