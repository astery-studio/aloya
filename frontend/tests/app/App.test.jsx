//Testa a inicialização, autenticação e navegação principal da aplicação.
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native'

jest.mock('expo-font', () => ({
    useFonts: jest.fn()
}))

jest.mock('expo-status-bar', () => ({
    StatusBar: jest.fn(() => null)
}))

jest.mock('@expo-google-fonts/dm-sans/400Regular', () => ({
    DMSans_400Regular: 'DMSans_400Regular'
}))

jest.mock('@expo-google-fonts/dm-sans/500Medium', () => ({
    DMSans_500Medium: 'DMSans_500Medium'
}))

jest.mock('@expo-google-fonts/dm-sans/600SemiBold', () => ({
    DMSans_600SemiBold: 'DMSans_600SemiBold'
}))

jest.mock('@expo-google-fonts/dm-sans/700Bold', () => ({
    DMSans_700Bold: 'DMSans_700Bold'
}))

jest.mock('../../services/createAppServices', () => ({
    criarServicosApp: jest.fn()
}))

jest.mock('../../services/auth/tokenStorage', () => ({
    obterToken: jest.fn()
}))

jest.mock('../../screens/auth/LoginScreen', () => {
    const React = require('react')
    const {Pressable, Text, View} = require('react-native')

    function LoginScreen({aoEntrar}) {
        return React.createElement(
            View,
            null,
            React.createElement(Text, null, 'Tela de login'),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Entrar no teste',
                    onPress: aoEntrar
                },
                React.createElement(Text, null, 'Entrar')
            )
        )
    }

    return {
        __esModule: true,
        default: jest.fn(LoginScreen)
    }
})

jest.mock('../../screens/testing/FlowSelectionScreen', () => {
    const React = require('react')

    function FlowSelectionScreen({onAbrirConfiguracoes}) {
        React.useEffect(() => {
            onAbrirConfiguracoes()
        }, [onAbrirConfiguracoes])

        return null
    }

    return {
        FlowSelectionScreen: jest.fn(FlowSelectionScreen)
    }
})

jest.mock('../../screens/settings/SettingsScreen', () => {
    const React = require('react')
    const {Pressable, Text, View} = require('react-native')

    function SettingsScreen({onAbrirPerfil}) {
        return React.createElement(
            View,
            null,
            React.createElement(Text, null, 'Tela de configurações'),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Abrir perfil no teste',
                    onPress: onAbrirPerfil
                },
                React.createElement(Text, null, 'Configurações de Perfil')
            )
        )
    }

    return {
        SettingsScreen: jest.fn(SettingsScreen)
    }
})

jest.mock('../../screens/settings/ProfileSettingsScreen', () => {
    const React = require('react')
    const {Pressable, Text, View} = require('react-native')

    function criarBotao(nome, onPress) {
        return React.createElement(
            Pressable,
            {
                key: nome,
                accessibilityRole: 'button',
                accessibilityLabel: nome,
                onPress
            },
            React.createElement(Text, null, nome)
        )
    }

    function ProfileSettingsScreen({
        perfil,
        carregando,
        erroCarregamento,
        onRecarregar,
        onSalvar,
        onVoltar,
        onAlterarSenha,
        onContaExcluida,
        onSessaoEncerrada
    }) {
        return React.createElement(
            View,
            null,
            React.createElement(Text, null, 'Tela de perfil'),
            React.createElement(Text, null, `Perfil carregado: ${perfil?.nome ?? 'nenhum'}`),
            React.createElement(Text, null, `Carregando perfil: ${carregando ? 'sim' : 'não'}`),
            React.createElement(Text, null, `Erro do perfil: ${erroCarregamento ? 'sim' : 'não'}`),
            criarBotao('Voltar para configurações no teste', onVoltar),
            criarBotao('Alterar senha no teste', onAlterarSenha),
            criarBotao('Recarregar perfil no teste', onRecarregar),
            criarBotao('Salvar perfil no teste', () => onSalvar({nome: 'Julia Atualizada'})),
            criarBotao('Encerrar sessão no teste', onSessaoEncerrada),
            criarBotao('Excluir conta no teste', onContaExcluida)
        )
    }

    return {
        ProfileSettingsScreen: jest.fn(ProfileSettingsScreen)
    }
})

jest.mock('../../screens/settings/ChangePasswordScreen', () => {
    const React = require('react')
    const {Pressable, Text, View} = require('react-native')

    function ChangePasswordScreen({onVoltar}) {
        return React.createElement(
            View,
            null,
            React.createElement(Text, null, 'Tela de alteração de senha'),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Voltar da alteração de senha',
                    onPress: onVoltar
                },
                React.createElement(Text, null, 'Voltar')
            )
        )
    }

    return {
        ChangePasswordScreen: jest.fn(ChangePasswordScreen)
    }
})

import {useFonts} from 'expo-font'

jest.mock('../../screens/support-network/NewSupportCategoryScreen', () => ({
    NewSupportCategoryScreen: jest.fn(() => null)
}))

import App from '../../App'
import {ProfileSettingsScreen} from '../../screens/settings/ProfileSettingsScreen'
import {obterToken} from '../../services/auth/tokenStorage'
import {criarServicosApp} from '../../services/createAppServices'

const perfil = {
    id: 15,
    nome: 'Julia',
    email: 'julia@email.com',
    dataNascimento: '1999-04-08',
    identidadeGenero: 'Mulher Cisgênero',
    atualizadoEm: '2026-09-23T10:00:00.000Z',
    consentimentoParentalNecessario: false
}

//Cria serviços falsos que permitem testar o App sem chamar a internet.
function criarServicos() {
    return {
        authService: {
            realizarLogin: jest.fn(),
            encerrarSessao: jest.fn()
        },
        accountService: {
            buscarPerfil: jest.fn().mockResolvedValue(perfil),
            atualizarPerfil: jest.fn().mockResolvedValue(perfil),
            alterarSenha: jest.fn(),
            excluirConta: jest.fn(),
            confirmarSenhaExclusao: jest.fn()
        }
    }
}

//Abre o perfil pelo mesmo botão utilizado pela pessoa usuária.
async function abrirPerfil() {
    await waitFor(() => {
        expect(screen.getByText('Tela de configurações')).toBeOnTheScreen()
    })

    await fireEvent.press(screen.getByRole('button', {
        name: 'Abrir perfil no teste'
    }))
}

describe('App', () => {
    let servicos

    beforeEach(() => {
        jest.clearAllMocks()
        servicos = criarServicos()
        useFonts.mockReturnValue([true, null])
        criarServicosApp.mockReturnValue(servicos)
        obterToken.mockResolvedValue(null)
    })

    test('mostra carregamento enquanto as fontes não estão prontas', async () => {
        useFonts.mockReturnValue([false, null])
        obterToken.mockImplementation(() => new Promise(() => undefined))

        await render(<App />)

        expect(screen.getByText('Carregando...')).toBeOnTheScreen()
    })

    test('mostra erro quando as fontes falham', async () => {
        useFonts.mockReturnValue([false, new Error('Falha ao carregar fontes')])

        await render(<App />)

        expect(screen.getByRole('alert')).toHaveTextContent('Ocorreu um erro')
        expect(screen.getByText('Não foi possível acessar a sessão segura deste aparelho.')).toBeOnTheScreen()
    })

    test('mostra erro seguro quando a API não pode ser configurada', async () => {
        criarServicosApp.mockImplementation(() => {
            throw new Error('URL interna inválida')
        })

        await render(<App />)

        expect(screen.getByText('Não foi possível configurar a conexão segura com a API.')).toBeOnTheScreen()
        expect(screen.queryByText('URL interna inválida')).toBeNull()
    })

    test('mostra erro quando o armazenamento seguro falha', async () => {
        obterToken.mockRejectedValue(new Error('Falha interna do armazenamento'))

        await render(<App />)

        await waitFor(() => {
            expect(screen.getByText('Não foi possível acessar a sessão segura deste aparelho.')).toBeOnTheScreen()
        })

        expect(screen.queryByText('Falha interna do armazenamento')).toBeNull()
    })

    test.each([
        null,
        {},
        {token: ''},
        {token: '   '},
        {token: 123}
    ])('abre o login para uma sessão inválida: %p', async sessao => {
        obterToken.mockResolvedValue(sessao)

        await render(<App />)

        await waitFor(() => {
            expect(screen.getByText('Tela de login')).toBeOnTheScreen()
        })

        expect(servicos.accountService.buscarPerfil).not.toHaveBeenCalled()
    })

    test('abre configurações e carrega o perfil de uma sessão válida', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        })

        await render(<App />)

        await waitFor(() => {
            expect(screen.getByText('Tela de configurações')).toBeOnTheScreen()
            expect(servicos.accountService.buscarPerfil).toHaveBeenCalledTimes(1)
        })

        await abrirPerfil()

        await waitFor(() => {
            expect(screen.getByText('Perfil carregado: Julia')).toBeOnTheScreen()
        })

        const propriedades = ProfileSettingsScreen.mock.calls.at(-1)[0]

        expect(propriedades.excluirConta).toBe(servicos.accountService.excluirConta)
        expect(propriedades.confirmarSenhaExclusao).toBe(servicos.accountService.confirmarSenhaExclusao)
        expect(propriedades.encerrarSessao).toBe(servicos.authService.encerrarSessao)
    })

    test('abre configurações depois do login e permite acessar o perfil', async () => {
        await render(<App />)

        await waitFor(() => {
            expect(screen.getByText('Tela de login')).toBeOnTheScreen()
        })

        await fireEvent.press(screen.getByRole('button', {
            name: 'Entrar no teste'
        }))

        await waitFor(() => {
            expect(screen.getByText('Tela de configurações')).toBeOnTheScreen()
            expect(servicos.accountService.buscarPerfil).toHaveBeenCalledTimes(1)
        })

        await abrirPerfil()

        await waitFor(() => {
            expect(screen.getByText('Perfil carregado: Julia')).toBeOnTheScreen()
        })
    })

    test('volta ao menu e permite entrar novamente no perfil', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        })

        await render(<App />)
        await abrirPerfil()

        await waitFor(() => {
            expect(screen.getByText('Tela de perfil')).toBeOnTheScreen()
        })

        await fireEvent.press(screen.getByRole('button', {
            name: 'Voltar para configurações no teste'
        }))

        expect(screen.getByText('Tela de configurações')).toBeOnTheScreen()

        await abrirPerfil()

        expect(screen.getByText('Tela de perfil')).toBeOnTheScreen()
        expect(servicos.accountService.buscarPerfil).toHaveBeenCalledTimes(1)
    })

    test('permite recarregar depois de erro no perfil', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        })

        servicos.accountService.buscarPerfil
            .mockRejectedValueOnce(new Error('Falha temporária'))
            .mockResolvedValueOnce(perfil)

        await render(<App />)

        await waitFor(() => {
            expect(servicos.accountService.buscarPerfil).toHaveBeenCalledTimes(1)
        })

        await abrirPerfil()

        await waitFor(() => {
            expect(screen.getByText('Erro do perfil: sim')).toBeOnTheScreen()
        })

        await fireEvent.press(screen.getByRole('button', {
            name: 'Recarregar perfil no teste'
        }))

        await waitFor(() => {
            expect(screen.getByText('Perfil carregado: Julia')).toBeOnTheScreen()
            expect(screen.getByText('Erro do perfil: não')).toBeOnTheScreen()
        })

        expect(servicos.accountService.buscarPerfil).toHaveBeenCalledTimes(2)
    })

    test('volta ao login quando a sessão é rejeitada pela API', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        })

        const erro = new Error('Sessão expirada')
        erro.status = 401

        servicos.accountService.buscarPerfil.mockRejectedValue(erro)

        await render(<App />)

        await waitFor(() => {
            expect(screen.getByText('Tela de login')).toBeOnTheScreen()
        })

        expect(screen.queryByText('Tela de configurações')).toBeNull()
        expect(screen.queryByText('Tela de perfil')).toBeNull()
    })

    test('atualiza o perfil salvo', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        })

        servicos.accountService.atualizarPerfil.mockResolvedValue({
            ...perfil,
            nome: 'Julia Atualizada'
        })

        await render(<App />)
        await abrirPerfil()

        await waitFor(() => {
            expect(screen.getByText('Perfil carregado: Julia')).toBeOnTheScreen()
        })

        await fireEvent.press(screen.getByRole('button', {
            name: 'Salvar perfil no teste'
        }))

        await waitFor(() => {
            expect(screen.getByText('Perfil carregado: Julia Atualizada')).toBeOnTheScreen()
        })

        expect(servicos.accountService.atualizarPerfil).toHaveBeenCalledWith({
            nome: 'Julia Atualizada'
        })
    })

    test('abre alteração de senha e volta ao perfil', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        })

        await render(<App />)
        await abrirPerfil()

        await fireEvent.press(screen.getByRole('button', {
            name: 'Alterar senha no teste'
        }))

        expect(screen.getByText('Tela de alteração de senha')).toBeOnTheScreen()

        await fireEvent.press(screen.getByRole('button', {
            name: 'Voltar da alteração de senha'
        }))

        expect(screen.getByText('Tela de perfil')).toBeOnTheScreen()
    })

    test('volta ao login depois do logout', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        })

        await render(<App />)
        await abrirPerfil()

        await fireEvent.press(screen.getByRole('button', {
            name: 'Encerrar sessão no teste'
        }))

        await waitFor(() => {
            expect(screen.getByText('Tela de login')).toBeOnTheScreen()
        })
    })

    test('volta ao login depois da exclusão da conta', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        })

        await render(<App />)
        await abrirPerfil()

        await fireEvent.press(screen.getByRole('button', {
            name: 'Excluir conta no teste'
        }))

        await waitFor(() => {
            expect(screen.getByText('Tela de login')).toBeOnTheScreen()
        })
    })
})