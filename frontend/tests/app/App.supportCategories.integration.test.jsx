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
        MembersScreen: ({
            service,
            categoriasService,
            onAbrirCategorias,
            onAdicionarContato,
            onAlterarVinculo,
            onSessaoExpirada
        }) =>
            React.createElement(
                View,
                null,
                React.createElement(Text, null, 'Tela de Membros'),
                React.createElement(
                    Text,
                    null,
                    service?.listar ? 'Contatos conectados' : 'Contatos ausentes'
                ),
                React.createElement(
                    Text,
                    null,
                    categoriasService?.listarCategorias
                        ? 'Categorias dos filtros conectadas'
                        : 'Categorias dos filtros ausentes'
                ),
                React.createElement(
                    Text,
                    null,
                    typeof onSessaoExpirada === 'function' ? 'Sessão conectada' : 'Sessão ausente'
                ),
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
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Alterar vínculo de Ana',
                        onPress: () =>
                            onAlterarVinculo?.({
                                id: 20,
                                email: 'ana@example.com',
                                iconeId: 'coracao',
                                corId: 'coral'
                            })
                    },
                    React.createElement(Text, null, 'Alterar vínculo')
                )
            )
    };
});

jest.mock('../../src/features/support-network/screens/SupportNetworkScreen', () => {
    const React = require('react');
    const { MembersScreen } = require('../../src/features/support-network/screens/MembersScreen');

    return {
        SupportNetworkScreen: (props) => React.createElement(MembersScreen, props)
    };
});

jest.mock('../../src/features/support-network/screens/ContactFormScreen/ContactFormScreen', () => {
    const React = require('react');

    const { Pressable, Text, View } = require('react-native');

    return {
        ContactFormScreen: ({
            contatoId,
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
                    testID: contatoId ? 'formulario-editar-contato' : 'formulario-novo-contato'
                },
                React.createElement(Text, null, contatoId ? 'Editar contato' : 'Novo contato'),
                contatoId ? React.createElement(Text, null, `Contato: ${contatoId}`) : null,
                React.createElement(Text, null, `Rascunho: ${dadosIniciais?.email ?? 'vazio'}`),
                React.createElement(
                    Text,
                    null,
                    `Categoria selecionada: ${dadosIniciais?.categoriaId ?? 'nenhuma'}`
                ),
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

jest.mock(
    '../../src/features/support-network/screens/ReceivedContactsScreen/ReceivedContactsScreen',
    () => {
        const React = require('react');

        const { Pressable, Text, View } = require('react-native');

        return {
            ReceivedContactsScreen: jest.fn(({ service, onSelecionarAba }) =>
                React.createElement(
                    View,
                    {
                        testID: 'contatos-recebidos'
                    },
                    React.createElement(Text, null, 'Contatos recebidos'),
                    React.createElement(
                        Text,
                        null,
                        service?.listarRecebidos
                            ? 'Convites recebidos conectados'
                            : 'Convites recebidos ausentes'
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Contato tenta abrir ciclos',
                            onPress: () => onSelecionarAba('ciclos')
                        },
                        React.createElement(Text, null, 'Abrir ciclos')
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Contato abre configurações',
                            onPress: () => onSelecionarAba('configuracoes')
                        },
                        React.createElement(Text, null, 'Abrir configurações')
                    )
                )
            )
        };
    }
);

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
        NewSupportCategoryScreen: ({ onVoltar, onCategoriaCriada, onConcluido }) =>
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
                        onPress: () => {
                            const categoria = {
                                id: 99,
                                nome: 'Nova categoria',
                                dadosVisiveis: ['geral.fase_atual'],
                                quantidadeContatos: 0
                            };

                            onCategoriaCriada?.(categoria);
                            onConcluido?.(categoria);
                        }
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
        contactLinkService: {
            consultar: jest.fn(),
            atualizar: jest.fn()
        },
        receivedContactsService: {
            listarRecebidos: jest.fn(),
            responderConvite: jest.fn()
        },
        supportCategoryService: {
            listarCategorias: jest.fn(),
            criarCategoria: jest.fn()
        },
        supportContactService: {
            listar: jest.fn(),
            reenviarConvite: jest.fn()
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

async function abrirEdicaoContato() {
    await abrirMembros();

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Alterar vínculo de Ana'
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

    test('conecta serviços e sessão à tela de contatos', async () => {
        await render(<App />);

        await abrirMembros();

        expect(screen.getByText('Contatos conectados')).toBeOnTheScreen();
        expect(screen.getByText('Categorias dos filtros conectadas')).toBeOnTheScreen();
        expect(screen.getByText('Sessão conectada')).toBeOnTheScreen();
    });

    test('abre a alteração de vínculo e retorna para a lista', async () => {
        await render(<App />);

        await abrirEdicaoContato();

        expect(screen.getByTestId('formulario-editar-contato')).toBeOnTheScreen();
        expect(screen.getByText('Contato: 20')).toBeOnTheScreen();
        expect(screen.getByText('Rascunho: ana@example.com')).toBeOnTheScreen();

        await fireEvent.press(screen.getByRole('button', { name: 'Concluir novo contato' }));

        expect(await screen.findByText('Tela de Membros')).toBeOnTheScreen();
    });

    test('abre os convites recebidos para uma conta de contato', async () => {
        const servicos = criarServicos();

        servicos.accountService.buscarPerfil.mockResolvedValue({
            nome: 'Contato',
            email: 'contato@example.com',
            papel: 'contato_apoio'
        });

        criarServicosApp.mockReturnValue(servicos);

        await render(<App />);

        expect(await screen.findByText('Contatos recebidos')).toBeOnTheScreen();
        expect(screen.getByText('Convites recebidos conectados')).toBeOnTheScreen();
        expect(screen.queryByText('Tela de Membros')).toBeNull();
    });

    test('bloqueia funcionalidades do titular para uma conta somente contato', async () => {
        const servicos = criarServicos();

        servicos.accountService.buscarPerfil.mockResolvedValue({
            nome: 'Contato',
            email: 'contato@example.com',
            papel: 'contato_apoio'
        });

        criarServicosApp.mockReturnValue(servicos);

        await render(<App />);

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Contato tenta abrir ciclos'
            })
        );

        expect(screen.getByText('Contatos recebidos')).toBeOnTheScreen();
        expect(screen.queryByTestId('cycle-history-flow')).toBeNull();
    });

    test('mantém configurações acessíveis para uma conta somente contato', async () => {
        const servicos = criarServicos();

        servicos.accountService.buscarPerfil.mockResolvedValue({
            nome: 'Contato',
            email: 'contato@example.com',
            papel: 'contato_apoio'
        });

        criarServicosApp.mockReturnValue(servicos);

        await render(<App />);

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Contato abre configurações'
            })
        );

        expect(await screen.findByText('Configurações')).toBeOnTheScreen();
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
        expect(screen.getByText('Categoria selecionada: 99')).toBeOnTheScreen();
    });
});
