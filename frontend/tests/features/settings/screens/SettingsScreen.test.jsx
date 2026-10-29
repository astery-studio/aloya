import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const mockAlterarPreferencia = jest.fn();

const mockLimparErro = jest.fn();

const mockUseThemePreferenceContext = jest.fn();

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const IconeTeste = () => null;

    return {
        ArrowsClockwiseIcon: IconeTeste,
        BellIcon: IconeTeste,
        HouseIcon: IconeTeste,
        InfoIcon: IconeTeste,
        MoonIcon: IconeTeste,
        ShieldCheckIcon: IconeTeste,
        UserIcon: IconeTeste,
        WarningCircleIcon: IconeTeste
    };
});

jest.mock('../../../../src/shared/components/common/NavigationField/NavigationField', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');

    function NavigationField({ label, onPress, desabilitado = false }) {
        const estaDesabilitado = desabilitado || typeof onPress !== 'function';

        return React.createElement(
            Pressable,
            {
                onPress,
                disabled: estaDesabilitado,
                accessibilityRole: 'button',
                accessibilityLabel: label,
                accessibilityState: {
                    disabled: estaDesabilitado
                }
            },
            React.createElement(Text, null, label)
        );
    }

    return {
        NavigationField
    };
});

jest.mock('../../../../src/shared/layouts/MainLayout/MainLayout', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    function MainLayout({ titulo, abaAtiva, onSelecionarAba, children }) {
        return React.createElement(
            View,
            null,
            React.createElement(Text, null, titulo),
            React.createElement(Text, null, `Aba ativa: ${abaAtiva}`),
            children,
            React.createElement(
                Pressable,
                {
                    onPress: () => onSelecionarAba?.('inicio'),
                    disabled: typeof onSelecionarAba !== 'function',
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Selecionar aba Início'
                },
                React.createElement(Text, null, 'Início')
            )
        );
    }

    return {
        MainLayout
    };
});

jest.mock('../../../../src/features/settings/components/ThemePreferenceSheet', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    function ThemePreferenceSheet({ visivel, preferencia, salvando, aoSelecionar, aoFechar }) {
        if (!visivel) {
            return null;
        }

        return React.createElement(
            View,
            {
                testID: 'seletor-aparencia'
            },
            React.createElement(Text, null, `Selecionada: ${preferencia}`),
            React.createElement(Text, null, `Salvando: ${String(salvando)}`),
            React.createElement(Pressable, {
                accessibilityRole: 'button',
                accessibilityLabel: 'Selecionar Escuro',
                onPress: () => aoSelecionar('escuro')
            }),
            React.createElement(Pressable, {
                accessibilityRole: 'button',
                accessibilityLabel: 'Fechar seletor',
                onPress: aoFechar
            })
        );
    }

    return {
        ThemePreferenceSheet
    };
});

jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    function SimpleModal({ visivel, titulo, mensagem, acaoPrincipal }) {
        if (!visivel) {
            return null;
        }

        return React.createElement(
            View,
            {
                testID: 'modal-erro-tema'
            },
            React.createElement(Text, null, titulo),
            React.createElement(Text, null, mensagem),
            React.createElement(Pressable, {
                accessibilityRole: 'button',
                accessibilityLabel: acaoPrincipal.texto,
                onPress: acaoPrincipal.aoPressionar
            })
        );
    }

    return {
        __esModule: true,
        default: SimpleModal
    };
});

jest.mock('../../../../src/features/settings/providers/ThemePreferenceProvider', () => ({
    useThemePreferenceContext: () => mockUseThemePreferenceContext()
}));

import { SettingsScreen } from '../../../../src/features/settings/screens/SettingsScreen';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function renderizarTela(propriedades = {}, preferenciaVisual = 'claro') {
    return render(
        <ThemeProvider preferencia={preferenciaVisual} esquemaDoSistema="light">
            <SettingsScreen {...propriedades} />
        </ThemeProvider>
    );
}

describe('SettingsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockUseThemePreferenceContext.mockReturnValue({
            preferencia: 'automatico',
            salvando: false,
            erro: null,
            alterarPreferencia: mockAlterarPreferencia,
            limparErro: mockLimparErro
        });
    });

    test('mostra todas as seções e opções do protótipo', async () => {
        await renderizarTela();

        expect(screen.getByText('Configurações')).toBeOnTheScreen();

        expect(screen.getByText('Minha Conta')).toBeOnTheScreen();

        expect(screen.getByText('Configurações de Perfil')).toBeOnTheScreen();

        expect(screen.getByText('Meu Ciclo')).toBeOnTheScreen();

        expect(screen.getByText('Parâmetros do Ciclo')).toBeOnTheScreen();

        expect(screen.getByText('Preferências')).toBeOnTheScreen();

        expect(screen.getByText('Aparência')).toBeOnTheScreen();

        expect(screen.getByText('Automático')).toBeOnTheScreen();

        expect(screen.getByText('Tela inicial')).toBeOnTheScreen();

        expect(screen.getByText('Notificações')).toBeOnTheScreen();

        expect(screen.getByText('Privacidade e Sobre')).toBeOnTheScreen();

        expect(screen.getByText('Sobre a aplicação')).toBeOnTheScreen();

        expect(screen.getByText('Políticas de Privacidade')).toBeOnTheScreen();

        expect(screen.getByText('Aba ativa: configuracoes')).toBeOnTheScreen();
    });

    test('encaminha separadamente cada ação de navegação', async () => {
        const onAbrirPerfil = jest.fn();

        const onAbrirParametrosCiclo = jest.fn();

        const onAbrirTelaInicial = jest.fn();

        const onAbrirNotificacoes = jest.fn();

        const onAbrirSobre = jest.fn();

        const onAbrirPoliticasPrivacidade = jest.fn();

        await renderizarTela({
            onAbrirPerfil,
            onAbrirParametrosCiclo,
            onAbrirTelaInicial,
            onAbrirNotificacoes,
            onAbrirSobre,
            onAbrirPoliticasPrivacidade
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Configurações de Perfil'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Parâmetros do Ciclo'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Tela inicial'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Notificações'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Sobre a aplicação'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Políticas de Privacidade'
            })
        );

        expect(onAbrirPerfil).toHaveBeenCalledTimes(1);

        expect(onAbrirParametrosCiclo).toHaveBeenCalledTimes(1);

        expect(onAbrirTelaInicial).toHaveBeenCalledTimes(1);

        expect(onAbrirNotificacoes).toHaveBeenCalledTimes(1);

        expect(onAbrirSobre).toHaveBeenCalledTimes(1);

        expect(onAbrirPoliticasPrivacidade).toHaveBeenCalledTimes(1);
    });

    test('abre e fecha o seletor de aparência', async () => {
        await renderizarTela();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Aparência: Automático'
            })
        );

        expect(screen.getByTestId('seletor-aparencia')).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Fechar seletor'
            })
        );

        await waitFor(() => {
            expect(screen.queryByTestId('seletor-aparencia')).toBeNull();
        });
    });

    test('encaminha a seleção de aparência', async () => {
        mockAlterarPreferencia.mockResolvedValue(true);

        await renderizarTela();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Aparência: Automático'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Selecionar Escuro'
            })
        );

        expect(mockAlterarPreferencia).toHaveBeenCalledWith('escuro');
    });

    test('bloqueia o campo durante o salvamento', async () => {
        mockUseThemePreferenceContext.mockReturnValue({
            preferencia: 'escuro',
            salvando: true,
            erro: null,
            alterarPreferencia: mockAlterarPreferencia,
            limparErro: mockLimparErro
        });

        await renderizarTela({}, 'escuro');

        expect(
            screen.getByRole('button', {
                name: 'Aparência: Escuro'
            })
        ).toBeDisabled();
    });

    test('mostra e limpa o erro de alteração', async () => {
        mockUseThemePreferenceContext.mockReturnValue({
            preferencia: 'claro',
            salvando: false,
            erro: 'Não foi possível atualizar sua preferência de tema.',
            alterarPreferencia: mockAlterarPreferencia,
            limparErro: mockLimparErro
        });

        await renderizarTela();

        expect(screen.getByText('Não foi possível alterar a aparência')).toBeOnTheScreen();

        expect(
            screen.getByText('Não foi possível atualizar sua preferência de tema.')
        ).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'OK'
            })
        );

        expect(mockLimparErro).toHaveBeenCalledTimes(1);
    });

    test('desabilita opções sem ação', async () => {
        await renderizarTela();

        expect(
            screen.getByRole('button', {
                name: 'Configurações de Perfil'
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'Parâmetros do Ciclo'
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'Tela inicial'
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'Notificações'
            })
        ).toBeDisabled();
    });

    test('encaminha a seleção da barra inferior', async () => {
        const onSelecionarAba = jest.fn();

        await renderizarTela({
            onSelecionarAba
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Selecionar aba Início'
            })
        );

        expect(onSelecionarAba).toHaveBeenCalledWith('inicio');
    });
});
