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
jest.mock('../../services/createAppServices', () => ({ criarServicosApp: jest.fn() }));
jest.mock('../../services/auth/tokenStorage', () => ({ obterToken: jest.fn() }));

jest.mock('../../screens/auth/WelcomeScreen', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return jest.fn(({ aoEntrar }) => React.createElement(
        Pressable,
        { accessibilityRole: 'button', accessibilityLabel: 'Ir para login', onPress: aoEntrar },
        React.createElement(Text, null, 'Boas-vindas')
    ));
});

jest.mock('../../screens/auth/LoginScreen', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return jest.fn(({ aoEntrar }) => React.createElement(
        Pressable,
        { accessibilityRole: 'button', accessibilityLabel: 'Concluir login', onPress: aoEntrar },
        React.createElement(Text, null, 'Login')
    ));
});

jest.mock('../../screens/auth/ForgotPasswordScreen', () => jest.fn(() => null));
jest.mock('../../screens/auth/ResetPasswordScreen', () => jest.fn(() => null));
jest.mock('../../screens/onboarding/OnboardingScreen', () => jest.fn(() => null));
jest.mock('../../screens/settings/ChangePasswordScreen', () => ({
    ChangePasswordScreen: jest.fn(() => null)
}));

jest.mock('../../screens/settings/SettingsScreen', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return {
        SettingsScreen: jest.fn(({ onAbrirPerfil }) => React.createElement(
            Pressable,
            { accessibilityRole: 'button', accessibilityLabel: 'Abrir perfil', onPress: onAbrirPerfil },
            React.createElement(Text, null, 'Configurações')
        ))
    };
});

jest.mock('../../screens/settings/ProfileSettingsScreen', () => {
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

import App from '../../App';
import { obterToken } from '../../services/auth/tokenStorage';
import { criarServicosApp } from '../../services/createAppServices';

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
