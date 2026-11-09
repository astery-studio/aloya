import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';

import App from '../../src/App';
import { criarServicosApp } from '../../src/app/createAppServices';
import { obterToken } from '../../src/shared/storage/tokenStorage';

jest.mock('expo-font', () => ({
    useFonts: () => [true, null]
}));

jest.mock('../../src/app/createAppServices', () => ({
    criarServicosApp: jest.fn()
}));

jest.mock('../../src/shared/storage/tokenStorage', () => ({
    obterToken: jest.fn()
}));

jest.mock('../../src/features/auth/screens/ForgotPasswordScreen', () => jest.fn(() => null));

jest.mock('../../src/features/auth/screens/LoginScreen', () => jest.fn(() => null));

jest.mock('../../src/features/auth/screens/ResetPasswordScreen', () => jest.fn(() => null));

jest.mock('../../src/features/auth/screens/WelcomeScreen', () => jest.fn(() => null));

jest.mock('../../src/features/onboarding/screens/OnboardingScreen', () => jest.fn(() => null));

jest.mock('../../src/features/calendar/screens/CalendarScreenContainer', () => ({
    CalendarScreenContainer: jest.fn(() => null)
}));

jest.mock('../../src/features/cycles/CycleHistoryFlow', () => ({
    CycleHistoryFlow: jest.fn(() => null)
}));

jest.mock('../../src/features/cycles/screens/CycleTodayContainer', () => ({
    CycleTodayContainer: jest.fn(() => null)
}));

jest.mock('../../src/features/contraceptives/ContraceptiveFlow', () => ({
    ContraceptiveFlow: jest.fn(() => null)
}));

jest.mock('../../src/features/settings/screens/ChangePasswordScreen', () => ({
    ChangePasswordScreen: jest.fn(() => null)
}));

jest.mock('../../src/features/settings/screens/ProfileSettingsScreen', () => ({
    ProfileSettingsScreen: jest.fn(() => null)
}));

jest.mock('../../src/features/settings/screens/SettingsScreen', () => {
    const React = require('react');

    const { Pressable, Text, View } = require('react-native');

    return {
        SettingsScreen: ({ onSelecionarAba }) =>
            React.createElement(
                View,
                null,
                React.createElement(Text, null, 'Configurações'),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Abrir membros',
                        onPress: () => onSelecionarAba('membros')
                    },
                    React.createElement(Text, null, 'Membros')
                )
            )
    };
});

jest.mock('../../src/features/support-network/screens/MembersScreen', () => {
    const React = require('react');

    const { Pressable, Text, View } = require('react-native');

    return {
        MembersScreen: ({ onAbrirCategorias, onAdicionarContato }) =>
            React.createElement(
                View,
                null,
                React.createElement(Text, null, 'Tela de Membros'),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Adicionar novo contato',
                        onPress: onAdicionarContato
                    },
                    React.createElement(Text, null, 'Adicionar contato')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Abrir categorias',
                        onPress: onAbrirCategorias
                    },
                    React.createElement(Text, null, 'Categorias')
                )
            )
    };
});

jest.mock('../../src/features/support-network/screens/ContactFormScreen/ContactFormScreen', () => {
    const React = require('react');

    const { Pressable, Text, View } = require('react-native');

    return {
        ContactFormScreen: ({
            dadosIniciais,
            emailUsuario,
            service,
            categoriasService,
            onVoltar,
            onSalvo,
            onCriarCategoria,
            onRascunhoAlterado
        }) =>
            React.createElement(
                View,
                {
                    testID: 'formulario-novo-contato'
                },
                React.createElement(Text, null, 'Novo contato'),
                React.createElement(Text, null, `Rascunho: ${dadosIniciais?.email ?? 'vazio'}`),
                React.createElement(Text, null, `Titular: ${emailUsuario ?? 'sem e-mail'}`),
                React.createElement(
                    Text,
                    null,
                    service?.enviarConvite ? 'Convites conectados' : 'Convites ausentes'
                ),
                React.createElement(
                    Text,
                    null,
                    categoriasService?.listarCategorias
                        ? 'Categorias conectadas'
                        : 'Categorias ausentes'
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Preencher rascunho do contato',
                        onPress: () =>
                            onRascunhoAlterado?.({
                                email: 'rascunho@example.com',
                                iconeId: 'lotus',
                                corId: 'verde',
                                categoriaId: 1,
                                permissoesIndividuais: []
                            })
                    },
                    React.createElement(Text, null, 'Preencher')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Voltar do novo contato',
                        onPress: onVoltar
                    },
                    React.createElement(Text, null, 'Voltar')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Concluir novo contato',
                        onPress: onSalvo
                    },
                    React.createElement(Text, null, 'Concluir')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Criar categoria pelo contato',
                        onPress: onCriarCategoria
                    },
                    React.createElement(Text, null, 'Criar categoria')
                )
            )
    };
});

jest.mock('../../src/features/support-network/screens/SupportCategoriesScreen', () => {
    const React = require('react');

    const { Pressable, Text, View } = require('react-native');

    return {
        SupportCategoriesScreen: jest.fn(({ service, onVoltar, onCriar, onEditar, onExcluir }) =>
            React.createElement(
                View,
                {
                    testID: 'categorias-permissao'
                },
                React.createElement(
                    Text,
                    null,
                    service?.listarCategorias ? 'Serviço conectado' : 'Serviço ausente'
                ),
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
                        accessibilityLabel: 'Criar categoria',
                        onPress: onCriar
                    },
                    React.createElement(Text, null, 'Criar')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Editar categoria',
                        onPress: () =>
                            onEditar({
                                id: 1,
                                nome: 'Família'
                            })
                    },
                    React.createElement(Text, null, 'Editar')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Excluir categoria',
                        onPress: () =>
                            onExcluir({
                                id: 1,
                                nome: 'Família'
                            })
                    },
                    React.createElement(Text, null, 'Excluir')
                )
            )
        )
    };
});

jest.mock('../../src/features/support-network/screens/NewSupportCategoryScreen', () => {
    const React = require('react');

    const { Pressable, Text, View } = require('react-native');

    return {
        NewSupportCategoryScreen: ({ onVoltar, onConcluido }) =>
            React.createElement(
                View,
                null,
                React.createElement(Text, null, 'Nova categoria'),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Cancelar criação',
                        onPress: onVoltar
                    },
                    React.createElement(Text, null, 'Cancelar')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Concluir criação',
                        onPress: onConcluido
                    },
                    React.createElement(Text, null, 'Concluir')
                )
            )
    };
});

function criarServicos() {
    return {
        authService: {},
        accountService: {
            buscarPerfil: jest.fn().mockResolvedValue({
                nome: 'Usuária',
                email: 'titular@example.com'
            })
        },
        themePreferenceService: {
            buscarPreferencia: jest.fn().mockResolvedValue('automatico'),
            atualizarPreferencia: jest.fn()
        },
        calendarService: {},
        contraceptiveService: {},
        cycleHistoryService: {},
        cyclePredictionService: {},
        contactInvitationService: {
            enviarConvite: jest.fn()
        },
        supportCategoryService: {
            listarCategorias: jest.fn(),
            criarCategoria: jest.fn()
        }
    };
}

async function abrirMembros() {
    await fireEvent.press(
        await screen.findByRole('button', {
            name: 'Abrir membros'
        })
    );
}

async function abrirCategorias() {
    await abrirMembros();

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Abrir categorias'
        })
    );
}

async function abrirNovoContato() {
    await abrirMembros();

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Adicionar novo contato'
        })
    );
}

describe('fluxos da Rede de Apoio no App', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        criarServicosApp.mockReturnValue(criarServicos());

        obterToken.mockResolvedValue({
            token: 'token-valido'
        });

        jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);

        jest.spyOn(Linking, 'addEventListener').mockReturnValue({
            remove: jest.fn()
        });

        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('abre a listagem de categorias e conecta o serviço', async () => {
        await render(<App />);

        await abrirCategorias();

        expect(await screen.findByText('Serviço conectado')).toBeOnTheScreen();
    });

    test('volta da listagem de categorias para membros', async () => {
        await render(<App />);

        await abrirCategorias();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar para membros'
            })
        );

        expect(await screen.findByText('Tela de Membros')).toBeOnTheScreen();
    });

    test('abre a criação e retorna para a listagem ao cancelar', async () => {
        await render(<App />);

        await abrirCategorias();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Criar categoria'
            })
        );

        expect(await screen.findByText('Nova categoria')).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Cancelar criação'
            })
        );

        expect(await screen.findByText('Serviço conectado')).toBeOnTheScreen();
    });

    test('retorna para a listagem depois de concluir a criação', async () => {
        await render(<App />);

        await abrirCategorias();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Criar categoria'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Concluir criação'
            })
        );

        expect(await screen.findByText('Serviço conectado')).toBeOnTheScreen();
    });

    test('encaminha edição e exclusão para os fluxos provisórios', async () => {
        await render(<App />);

        await abrirCategorias();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Editar categoria'
            })
        );

        expect(Alert.alert).toHaveBeenCalledWith('Editar categoria', 'Família');

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Excluir categoria'
            })
        );

        expect(Alert.alert).toHaveBeenCalledWith('Excluir categoria', 'Família');
    });

    test('abre o formulário de contato com os serviços conectados', async () => {
        await render(<App />);

        await abrirNovoContato();

        expect(await screen.findByText('Novo contato')).toBeOnTheScreen();

        expect(screen.getByText('Convites conectados')).toBeOnTheScreen();

        expect(screen.getByText('Categorias conectadas')).toBeOnTheScreen();
    });

    test('volta do formulário de contato para membros', async () => {
        await render(<App />);

        await abrirNovoContato();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar do novo contato'
            })
        );

        expect(await screen.findByText('Tela de Membros')).toBeOnTheScreen();
    });

    test('retorna para membros depois de salvar o contato', async () => {
        await render(<App />);

        await abrirNovoContato();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Concluir novo contato'
            })
        );

        expect(await screen.findByText('Tela de Membros')).toBeOnTheScreen();
    });

    test('cria categoria pelo formulário e retorna ao novo contato', async () => {
        await render(<App />);

        await abrirNovoContato();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Preencher rascunho do contato'
            })
        );

        expect(screen.getByText('Rascunho: rascunho@example.com')).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Criar categoria pelo contato'
            })
        );

        expect(await screen.findByText('Nova categoria')).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Concluir criação'
            })
        );

        expect(await screen.findByText('Novo contato')).toBeOnTheScreen();

        expect(screen.getByText('Categorias conectadas')).toBeOnTheScreen();
        expect(screen.getByText('Rascunho: rascunho@example.com')).toBeOnTheScreen();
    });
});
