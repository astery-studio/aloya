/**
 * Confere a ligação entre autenticação, sessão persistida e configurações.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

jest.mock('expo-font', () => ({ useFonts: jest.fn(() => [true, null]) }));
jest.mock('expo-status-bar', () => ({ StatusBar: jest.fn(() => null) }));
jest.mock('@expo-google-fonts/dm-sans/400Regular', () => ({ DMSans_400Regular: 'regular' }));
jest.mock('@expo-google-fonts/dm-sans/500Medium', () => ({ DMSans_500Medium: 'medium' }));
jest.mock('@expo-google-fonts/dm-sans/600SemiBold', () => ({ DMSans_600SemiBold: 'semibold' }));
jest.mock('@expo-google-fonts/dm-sans/700Bold', () => ({ DMSans_700Bold: 'bold' }));
jest.mock('../../src/app/createAppServices', () => ({ criarServicosApp: jest.fn() }));
jest.mock('../../src/shared/storage/tokenStorage', () => ({ obterToken: jest.fn() }));

jest.mock('../../src/features/auth/screens/WelcomeScreen', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return jest.fn(({ aoEntrar }) => React.createElement(
        Pressable,
        { accessibilityRole: 'button', accessibilityLabel: 'Ir para login', onPress: aoEntrar },
        React.createElement(Text, null, 'Boas-vindas')
    ));
});

jest.mock('../../src/features/auth/screens/LoginScreen', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return jest.fn(({ aoEntrar }) => React.createElement(
        Pressable,
        { accessibilityRole: 'button', accessibilityLabel: 'Concluir login', onPress: aoEntrar },
        React.createElement(Text, null, 'Login')
    ));
});

jest.mock('../../src/features/auth/screens/ForgotPasswordScreen', () => jest.fn(() => null));
jest.mock('../../src/features/auth/screens/ResetPasswordScreen', () => jest.fn(() => null));
jest.mock('../../src/features/onboarding/screens/OnboardingScreen', () => jest.fn(() => null));
jest.mock('../../src/features/settings/screens/ChangePasswordScreen', () => ({
    ChangePasswordScreen: jest.fn(() => null)
}));

jest.mock('../../src/features/settings/screens/SettingsScreen', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return {
        SettingsScreen: jest.fn(({ onAbrirPerfil, onSelecionarAba }) => React.createElement(
            View,
            null,
            React.createElement(Text, null, 'Configurações'),
            React.createElement(
                Pressable,
                { accessibilityRole: 'button', accessibilityLabel: 'Abrir perfil', onPress: onAbrirPerfil },
                React.createElement(Text, null, 'Perfil')
            ),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Abrir membros',
                    onPress: () => onSelecionarAba?.('membros')
                },
                React.createElement(Text, null, 'Membros')
            )
        ))
    };
});

jest.mock('../../src/features/support-network/screens/MembersScreen', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return {
        MembersScreen: jest.fn(({ onCriarCategoria, onSelecionarAba }) => React.createElement(
            View,
            null,
            React.createElement(Text, null, 'Tela de Membros'),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Criar nova categoria',
                    onPress: onCriarCategoria
                },
                React.createElement(Text, null, 'Criar categoria')
            ),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Voltar para configurações',
                    onPress: () => onSelecionarAba?.('configuracoes')
                },
                React.createElement(Text, null, 'Configurações')
            )
        ))
    };
});

jest.mock('../../src/features/support-network/screens/NewSupportCategoryScreen', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return {
        NewSupportCategoryScreen: jest.fn(({ onVoltar, onConcluido }) => React.createElement(
            View,
            null,
            React.createElement(Text, null, 'Nova categoria'),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Voltar para membros',
                    onPress: onVoltar
                },
                React.createElement(Text, null, 'Voltar')
            ),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Concluir categoria',
                    onPress: onConcluido
                },
                React.createElement(Text, null, 'Concluir')
            )
        ))
    };
});

jest.mock('../../src/features/settings/screens/ProfileSettingsScreen', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return {
        ProfileSettingsScreen: jest.fn(({ perfil, onSessaoEncerrada }) => React.createElement(
            View,
            null,
            React.createElement(Text, null, `Perfil: ${perfil?.nome ?? 'carregando'}`),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Finalizar sessão',
                    onPress: onSessaoEncerrada
                },
                React.createElement(Text, null, 'Sair')
            )
        ))
    };
});

import App from '../../src/App';
import { obterToken } from '../../src/shared/storage/tokenStorage';
import { criarServicosApp } from '../../src/app/createAppServices';

function criarServicos() {
    return {
        authService: {
            realizarLogin: jest.fn(),
            solicitarRecuperacao: jest.fn(),
            redefinirSenha: jest.fn(),
            cadastrar: jest.fn(),
            verificarEmailDisponivel: jest.fn(),
            encerrarSessao: jest.fn()
        },
        accountService: {
            buscarPerfil: jest.fn().mockResolvedValue({
                id: 1,
                nome: 'Julia',
                email: 'julia@email.com',
                dataNascimento: '1999-04-08',
                identidadeGenero: null
            }),
            atualizarPerfil: jest.fn(),
            alterarSenha: jest.fn(),
            confirmarSenhaExclusao: jest.fn(),
            excluirConta: jest.fn()
        },
        contraceptiveService: {},
        supportCategoryService: {
            criarCategoria: jest.fn()
        }
    };
}

describe('App integrado', () => {
    let servicos;

    beforeEach(() => {
        jest.clearAllMocks();
        servicos = criarServicos();
        criarServicosApp.mockReturnValue(servicos);
        jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
        jest.spyOn(Linking, 'addEventListener').mockReturnValue({ remove: jest.fn() });
    });

    afterEach(() => jest.restoreAllMocks());

    test('mantém o fluxo público quando não existe sessão', async () => {
        obterToken.mockResolvedValue(null);

        await render(<App />);

        expect(await screen.findByText('Boas-vindas')).toBeOnTheScreen();
        expect(servicos.accountService.buscarPerfil).not.toHaveBeenCalled();
    });

    test('restaura a sessão, abre configurações e carrega o perfil', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });

        await render(<App />);

        expect(await screen.findByText('Configurações')).toBeOnTheScreen();
        await fireEvent.press(screen.getByRole('button', { name: 'Abrir perfil' }));

        await waitFor(() => {
            expect(screen.getByText('Perfil: Julia')).toBeOnTheScreen();
        });
        expect(servicos.accountService.buscarPerfil).toHaveBeenCalledTimes(1);
    });

    test('abre membros e inicia a criação de categoria', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });

        await render(<App />);

        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir membros' }));
        expect(await screen.findByText('Tela de Membros')).toBeOnTheScreen();

        await fireEvent.press(screen.getByRole('button', { name: 'Criar nova categoria' }));
        expect(await screen.findByText('Nova categoria')).toBeOnTheScreen();
    });

    test('volta da criação de categoria para membros', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });

        await render(<App />);

        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir membros' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Criar nova categoria' }));
        await fireEvent.press(await screen.findByRole('button', { name: 'Voltar para membros' }));

        expect(await screen.findByText('Tela de Membros')).toBeOnTheScreen();
    });

    test('retorna para membros depois de concluir a categoria', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });

        await render(<App />);

        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir membros' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Criar nova categoria' }));
        await fireEvent.press(await screen.findByRole('button', { name: 'Concluir categoria' }));

        expect(await screen.findByText('Tela de Membros')).toBeOnTheScreen();
    });

    test('retorna de membros para configurações pelo menu', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });

        await render(<App />);

        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir membros' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Voltar para configurações' }));

        expect(await screen.findByText('Configurações')).toBeOnTheScreen();
    });

    test('entra pelas boas-vindas e retorna ao login depois de encerrar a sessão', async () => {
        obterToken.mockResolvedValue(null);

        await render(<App />);

        await fireEvent.press(await screen.findByRole('button', { name: 'Ir para login' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Concluir login' }));
        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir perfil' }));
        await fireEvent.press(await screen.findByRole('button', { name: 'Finalizar sessão' }));

        expect(await screen.findByText('Login')).toBeOnTheScreen();
        expect(servicos.accountService.buscarPerfil).toHaveBeenCalledTimes(1);
    });
});
