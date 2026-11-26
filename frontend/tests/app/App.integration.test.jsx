/**
 * Confere a ligação entre autenticação, sessão persistida e os fluxos internos.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
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

    return jest.fn(({ aoEntrar, aoCriarConta }) =>
        React.createElement(
            React.Fragment,
            null,
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Ir para login',
                    onPress: aoEntrar
                },
                React.createElement(Text, null, 'Boas-vindas')
            ),
            React.createElement(Pressable, {
                accessibilityRole: 'button',
                accessibilityLabel: 'Ir para cadastro',
                onPress: aoCriarConta
            })
        )
    );
});

jest.mock('../../src/features/auth/screens/LoginScreen', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');

    return jest.fn(({ aoEntrar }) =>
        React.createElement(
            React.Fragment,
            null,
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Concluir login',
                    onPress: aoEntrar
                },
                React.createElement(Text, null, 'Login')
            )
        )
    );
});

jest.mock('../../src/features/auth/screens/ForgotPasswordScreen', () => jest.fn(() => null));
jest.mock('../../src/features/auth/screens/ResetPasswordScreen', () => jest.fn(() => null));
jest.mock('../../src/features/onboarding/screens/OnboardingScreen', () => {
    const React = require('react');
    const { Pressable } = require('react-native');
    return jest.fn(({ aoConsultarDocumentos, aoConcluir }) =>
        React.createElement(
            React.Fragment,
            null,
            React.createElement(Pressable, {
                accessibilityRole: 'link',
                accessibilityLabel: 'Consultar no cadastro',
                onPress: () => aoConsultarDocumentos?.('terms')
            }),
            React.createElement(Pressable, {
                accessibilityRole: 'button',
                accessibilityLabel: 'Concluir cadastro de contato',
                onPress: () => aoConcluir({ tipoUsuario: 'contato_apoio' })
            })
        )
    );
});

jest.mock('../../src/features/settings/screens/ChangePasswordScreen', () => ({
    ChangePasswordScreen: jest.fn(() => null)
}));

jest.mock('../../src/features/contraceptives/ContraceptiveFlow', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        ContraceptiveFlow: jest.fn(({ onVoltar }) =>
            React.createElement(
                View,
                null,
                React.createElement(Text, null, 'Fluxo de anticoncepcionais'),
                React.createElement(Pressable, {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Voltar ao ciclo',
                    onPress: onVoltar
                })
            )
        )
    };
});

jest.mock('../../src/features/cycles/CycleHistoryFlow', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');

    return {
        CycleHistoryFlow: jest.fn(({ aoAbrirCalendario }) =>
            React.createElement(
                React.Fragment,
                null,
                React.createElement(Text, null, 'Histórico de ciclos integrado'),
                React.createElement(Pressable, {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Ir para o Calendário',
                    onPress: aoAbrirCalendario
                })
            )
        )
    };
});

jest.mock('../../src/features/diary/DiaryFlow', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return { DiaryFlow: jest.fn(() => React.createElement(Text, null, 'Diário integrado')) };
});

jest.mock('../../src/features/diary/components/DiaryCategoriesSheet/DiaryCategoriesSheet', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return {
        DiaryCategoriesSheet: jest.fn(({ visivel, onFechar }) =>
            visivel
                ? React.createElement(
                      View,
                      null,
                      React.createElement(Text, null, 'Categorias do Diário integradas'),
                      React.createElement(Pressable, {
                          accessibilityRole: 'button',
                          accessibilityLabel: 'Fechar categorias do Diário',
                          onPress: onFechar
                      })
                  )
                : null
        )
    };
});

jest.mock('../../src/features/diary/components/NewDiaryEntrySheet/NewDiaryEntrySheet', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return {
        NewDiaryEntrySheet: jest.fn(({ visivel, dataInicial, onFechar }) =>
            visivel
                ? React.createElement(
                      View,
                      null,
                      React.createElement(Text, null, 'Cadastro do Diário aberto'),
                      React.createElement(Text, null, `Data do Diário: ${dataInicial}`),
                      React.createElement(
                          Pressable,
                          {
                              accessibilityRole: 'button',
                              accessibilityLabel: 'Fechar cadastro do Diário',
                              onPress: onFechar
                          },
                          React.createElement(Text, null, 'Fechar')
                      )
                  )
                : null
        )
    };
});

jest.mock('../../src/features/cycles/CycleEditFlow', () => {
    const React = require('react');
    const { Text } = require('react-native');

    return {
        CycleEditFlow: jest.fn(({ ciclo }) =>
            React.createElement(Text, null, `Editando ciclo ${ciclo.id}`)
        )
    };
});

jest.mock('../../src/features/calendar/screens/CalendarScreenContainer', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        CalendarScreenContainer: jest.fn(({ aoEditarCiclo }) => {
            const instancia = React.useId();

            return React.createElement(
                View,
                null,
                React.createElement(Text, { testID: 'instancia-calendario' }, instancia),
                React.createElement(Text, null, 'Calendário integrado'),
                React.createElement(Pressable, {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Editar menstruação do calendário',
                    onPress: () => aoEditarCiclo({ registroCicloId: 9 })
                })
            );
        })
    };
});

jest.mock('../../src/features/cycles/screens/CycleTodayContainer', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return {
        CycleTodayContainer: jest.fn(
            ({ aoAbrirAnticoncepcional, aoAbrirHistorico, aoCadastrarDiario, aoSelecionarAba }) =>
                React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Anticoncepcional',
                            onPress: aoAbrirAnticoncepcional
                        },
                        React.createElement(Text, null, 'Ciclo hoje')
                    ),
                    React.createElement(Pressable, {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Abrir histórico do ciclo',
                        onPress: aoAbrirHistorico
                    }),
                    React.createElement(Pressable, {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Cadastrar no Diário',
                        onPress: () => aoCadastrarDiario('2026-11-05')
                    }),
                    ...[
                        ['Abrir configurações', 'configuracoes'],
                        ['Abrir início', 'inicio'],
                        ['Abrir ciclos', 'ciclos'],
                        ['Abrir Diário', 'diario'],
                        ['Abrir membros', 'membros']
                    ].map(([rotulo, aba]) =>
                        React.createElement(Pressable, {
                            key: aba,
                            accessibilityRole: 'button',
                            accessibilityLabel: rotulo,
                            onPress: () => aoSelecionarAba?.(aba)
                        })
                    )
                )
        )
    };
});

jest.mock('../../src/features/cycles/screens/CycleParametersScreen', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return {
        CycleParametersScreen: jest.fn(({ onVoltar }) =>
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Voltar dos parâmetros',
                    onPress: onVoltar
                },
                React.createElement(Text, null, 'Parâmetros integrados')
            )
        )
    };
});

jest.mock('../../src/features/contraceptives/testing/ContraceptiveHuTestAccess', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return {
        ContraceptiveHuTestAccess: jest.fn(({ onVoltar }) =>
            React.createElement(
                View,
                null,
                React.createElement(Text, null, 'Fluxo de anticoncepcionais'),
                React.createElement(Pressable, {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Voltar ao ciclo',
                    onPress: onVoltar
                })
            )
        )
    };
});

jest.mock('../../src/features/settings/screens/SettingsScreen', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        SettingsScreen: jest.fn(
            ({
                onAbrirPerfil,
                onAbrirParametrosCiclo,
                onSelecionarAba,
                onAbrirPoliticasPrivacidade
            }) =>
                React.createElement(
                    View,
                    null,
                    React.createElement(Text, null, 'Configurações'),
                    React.createElement(Pressable, {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Consultar em configurações',
                        onPress: onAbrirPoliticasPrivacidade
                    }),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Abrir parâmetros',
                            onPress: onAbrirParametrosCiclo
                        },
                        React.createElement(Text, null, 'Parâmetros')
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Abrir perfil',
                            onPress: onAbrirPerfil
                        },
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
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Abrir ciclos',
                            onPress: () => onSelecionarAba?.('ciclos')
                        },
                        React.createElement(Text, null, 'Ciclos')
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Abrir início',
                            onPress: () => onSelecionarAba?.('inicio')
                        },
                        React.createElement(Text, null, 'Início')
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Abrir Diário',
                            onPress: () => onSelecionarAba?.('diario')
                        },
                        React.createElement(Text, null, 'Diário')
                    )
                )
        )
    };
});

jest.mock('../../src/features/support-network/screens/MembersScreen', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        MembersScreen: jest.fn(({ onCriarCategoria, onSelecionarAba }) =>
            React.createElement(
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

jest.mock('../../src/features/support-network/screens/NewSupportCategoryScreen', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        NewSupportCategoryScreen: jest.fn(({ onVoltar, onConcluido }) =>
            React.createElement(
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
            )
        )
    };
});

jest.mock('../../src/features/settings/screens/ProfileSettingsScreen', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        ProfileSettingsScreen: jest.fn(({ perfil, onSessaoEncerrada }) =>
            React.createElement(
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
            )
        )
    };
});

import App from '../../src/App';
import { criarServicosApp } from '../../src/app/createAppServices';
import { NewSupportCategoryScreen } from '../../src/features/support-network/screens/NewSupportCategoryScreen';
import { CycleEditFlow } from '../../src/features/cycles/CycleEditFlow';
import { CycleHistoryFlow } from '../../src/features/cycles/CycleHistoryFlow';
import { DiaryFlow } from '../../src/features/diary/DiaryFlow';
import { obterToken } from '../../src/shared/storage/tokenStorage';

//Cria os serviços usados pelo App durante os testes de integração.
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
        themePreferenceService: {
            buscarPreferencia: jest.fn().mockResolvedValue('automatico'),
            atualizarPreferencia: jest.fn()
        },
        contraceptiveService: {},
        calendarService: {
            buscarMes: jest.fn(),
            removerDia: jest.fn(),
            excluirCiclo: jest.fn()
        },
        cycleHistoryService: {
            listarPagina: jest.fn(),
            buscar: jest.fn().mockResolvedValue({
                id: '9',
                dataInicio: '2026-09-04',
                dataFim: '2026-09-08'
            }),
            editar: jest.fn()
        },
        cycleParametersService: {
            buscar: jest.fn(),
            atualizar: jest.fn()
        },
        supportCategoryService: {
            criarCategoria: jest.fn()
        },
        diaryService: { buscarCatalogo: jest.fn(), criarRegistro: jest.fn() }
    };
}

describe('App integrado', () => {
    let servicos;

    beforeEach(() => {
        jest.clearAllMocks();
        servicos = criarServicos();
        criarServicosApp.mockReturnValue(servicos);
        jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
        jest.spyOn(Linking, 'addEventListener').mockReturnValue({
            remove: jest.fn()
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test.each([
        [null, 'Ir para cadastro', 'Consultar no cadastro', 'link', 'Termos de uso'],
        [{ token: 'token-valido' }, null, 'Consultar em configurações', 'button', 'Privacidade']
    ])(
        'abre e fecha documentos sem desmontar sua origem (%s, %s)',
        async (sessao, entrada, nome, role, aba) => {
            obterToken.mockResolvedValue(sessao);
            await render(<App />);
            if (entrada)
                await fireEvent.press(await screen.findByRole('button', { name: entrada }));
            if (sessao)
                await fireEvent.press(
                    await screen.findByRole('button', { name: 'Abrir configurações' })
                );
            const origem = await screen.findByRole(role, { name: nome });
            await fireEvent.press(origem);
            expect(screen.getByRole('tab', { name: aba, selected: true })).toBeOnTheScreen();
            await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
            expect(screen.getByRole(role, { name: nome })).toBe(origem);
            if (!sessao) expect(servicos.accountService.buscarPerfil).not.toHaveBeenCalled();
        }
    );

    test('mantém o fluxo público quando não existe sessão', async () => {
        obterToken.mockResolvedValue(null);

        await render(<App />);

        expect(await screen.findByText('Boas-vindas')).toBeOnTheScreen();

        expect(servicos.accountService.buscarPerfil).not.toHaveBeenCalled();
    });

    test('abre a Home após concluir o cadastro de uma conta de contato', async () => {
        obterToken.mockResolvedValue(null);

        await render(<App />);
        await fireEvent.press(await screen.findByRole('button', { name: 'Ir para cadastro' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Concluir cadastro de contato' }));

        expect(await screen.findByText('Ciclo hoje')).toBeOnTheScreen();
    });

    test('restaura a sessão, abre a Home e carrega o perfil', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        });

        await render(<App />);

        expect(await screen.findByText('Ciclo hoje')).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Abrir configurações'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Abrir perfil'
            })
        );

        await waitFor(() => {
            expect(screen.getByText('Perfil: Julia')).toBeOnTheScreen();
        });

        expect(servicos.accountService.buscarPerfil).toHaveBeenCalledTimes(1);
    });

    test('abre os parâmetros pela tela de configurações', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });
        await render(<App />);

        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir configurações' }));

        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir parâmetros' }));
        expect(await screen.findByText('Parâmetros integrados')).toBeOnTheScreen();

        await fireEvent.press(screen.getByRole('button', { name: 'Voltar dos parâmetros' }));
        expect(await screen.findByText('Configurações')).toBeOnTheScreen();
    });

    test('abre o histórico integrado com o serviço configurado', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        });

        await render(<App />);

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Abrir ciclos'
            })
        );

        expect(await screen.findByText('Histórico de ciclos integrado')).toBeOnTheScreen();

        expect(CycleHistoryFlow).toHaveBeenCalledWith(
            expect.objectContaining({
                service: servicos.cycleHistoryService,
                aoAbrirCalendario: expect.any(Function),
                onSelecionarAba: expect.any(Function),
                onSessaoExpirada: expect.any(Function)
            }),
            undefined
        );
    });

    test('abre o Diário integrado pelo menu', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });
        await render(<App />);
        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir Diário' }));

        expect(await screen.findByText('Diário integrado')).toBeOnTheScreen();
        expect(DiaryFlow).toHaveBeenCalledWith(
            expect.objectContaining({
                service: servicos.diaryService,
                calendarService: servicos.calendarService,
                onSelecionarAba: expect.any(Function),
                onSessaoExpirada: expect.any(Function),
                aoGerenciarCategorias: expect.any(Function)
            }),
            undefined
        );
    });

    test('abre categorias pelo Diário e retorna à origem', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });
        await render(<App />);
        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir Diário' }));

        await act(() => DiaryFlow.mock.calls.at(-1)[0].aoGerenciarCategorias());
        expect(await screen.findByText('Categorias do Diário integradas')).toBeOnTheScreen();

        await fireEvent.press(screen.getByRole('button', { name: 'Fechar categorias do Diário' }));
        expect(await screen.findByText('Diário integrado')).toBeOnTheScreen();
    });

    test('abre a edição de menstruação ao tocar no ciclo do calendário', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });
        await render(<App />);

        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir início' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Abrir histórico do ciclo' }));
        await fireEvent.press(await screen.findByRole('button', { name: 'Ir para o Calendário' }));
        await fireEvent.press(
            await screen.findByRole('button', { name: 'Editar menstruação do calendário' })
        );

        expect(servicos.cycleHistoryService.buscar).toHaveBeenCalledWith(9);
        expect(await screen.findByText('Editando ciclo 9')).toBeOnTheScreen();

        const instanciaAnterior = screen.getByTestId('instancia-calendario').props.children;
        await act(() => CycleEditFlow.mock.calls.at(-1)[0].onAtualizado());
        expect(screen.getByTestId('instancia-calendario').props.children).not.toBe(
            instanciaAnterior
        );

        await act(() => CycleEditFlow.mock.calls.at(-1)[0].onFechar());
        expect(screen.queryByText('Editando ciclo 9')).toBeNull();
    });

    test('abre membros e inicia a criação de categoria', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        });

        await render(<App />);

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Abrir membros'
            })
        );

        expect(await screen.findByText('Tela de Membros')).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Criar nova categoria'
            })
        );

        expect(await screen.findByText('Nova categoria')).toBeOnTheScreen();
        expect(NewSupportCategoryScreen).toHaveBeenCalledWith(
            expect.objectContaining({ diaryService: servicos.diaryService }),
            undefined
        );
    });

    test('volta da criação de categoria para membros', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        });

        await render(<App />);

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Abrir membros'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Criar nova categoria'
            })
        );

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Voltar para membros'
            })
        );

        expect(await screen.findByText('Tela de Membros')).toBeOnTheScreen();
    });

    test('retorna para membros depois de concluir a categoria', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        });

        await render(<App />);

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Abrir membros'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Criar nova categoria'
            })
        );

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Concluir categoria'
            })
        );

        expect(await screen.findByText('Tela de Membros')).toBeOnTheScreen();
    });

    test('retorna de membros para configurações pelo menu', async () => {
        obterToken.mockResolvedValue({
            token: 'token-valido'
        });

        await render(<App />);

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Abrir membros'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar para configurações'
            })
        );

        expect(await screen.findByText('Configurações')).toBeOnTheScreen();
    });

    test('abre anticoncepcionais pela HU-013 e volta para a tela de ciclo', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });

        await render(<App />);

        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir início' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Anticoncepcional' }));
        expect(await screen.findByText('Fluxo de anticoncepcionais')).toBeOnTheScreen();

        await fireEvent.press(screen.getByRole('button', { name: 'Voltar ao ciclo' }));
        expect(await screen.findByText('Ciclo hoje')).toBeOnTheScreen();
    });

    test('abre diretamente o cadastro do Diário pela tela inicial', async () => {
        obterToken.mockResolvedValue({ token: 'token-valido' });
        await render(<App />);

        await fireEvent.press(await screen.findByRole('button', { name: 'Abrir início' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar no Diário' }));

        expect(await screen.findByText('Cadastro do Diário aberto')).toBeOnTheScreen();
        expect(screen.getByText('Data do Diário: 2026-11-05')).toBeOnTheScreen();
        expect(screen.getByText('Ciclo hoje')).toBeOnTheScreen();

        await fireEvent.press(screen.getByRole('button', { name: 'Fechar cadastro do Diário' }));
        expect(screen.queryByText('Cadastro do Diário aberto')).not.toBeOnTheScreen();
    });

    test('entra pelas boas-vindas e retorna ao login depois de encerrar a sessão', async () => {
        obterToken.mockResolvedValue(null);

        await render(<App />);

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Ir para login'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Concluir login'
            })
        );

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Abrir configurações'
            })
        );

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Abrir perfil'
            })
        );

        await fireEvent.press(
            await screen.findByRole('button', {
                name: 'Finalizar sessão'
            })
        );

        expect(await screen.findByText('Login')).toBeOnTheScreen();

        expect(servicos.accountService.buscarPerfil).toHaveBeenCalledTimes(1);
    });

    test.each(['principal', 'contato_apoio', 'principal_e_contato_apoio'])(
        'mantém a Home como primeira tela para o papel %s',
        async (papel) => {
            obterToken.mockResolvedValue({ token: 'token-valido' });
            servicos.accountService.buscarPerfil.mockResolvedValue({
                id: 1,
                nome: 'Julia',
                email: 'julia@email.com',
                papel
            });

            await render(<App />);

            expect(await screen.findByText('Ciclo hoje')).toBeOnTheScreen();
            await waitFor(() => {
                expect(servicos.accountService.buscarPerfil).toHaveBeenCalledTimes(1);
            });
            expect(screen.getByText('Ciclo hoje')).toBeOnTheScreen();
        }
    );
});
