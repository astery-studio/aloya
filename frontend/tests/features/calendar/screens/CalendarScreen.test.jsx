import React from 'react';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import {
    CalendarScreen,
    TEMPO_REAPARECER_AVISO_MS
} from '../../../../src/features/calendar/screens/CalendarScreen';
import { estilos } from '../../../../src/features/calendar/screens/CalendarScreen.styles';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/common/ConfidenceBadge/ConfidenceBadge', () => {
    const ReactInterno = require('react');
    const { Pressable, Text } = require('react-native');

    return {
        ConfidenceBadge: ({ nivel, onPress, rotuloAcessibilidade }) =>
            ReactInterno.createElement(
                Pressable,
                {
                    testID: 'confidence-badge',
                    accessibilityRole: 'button',
                    accessibilityLabel: rotuloAcessibilidade,
                    onPress
                },
                ReactInterno.createElement(Text, null, nivel)
            )
    };
});

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    ArrowLeftIcon: () => null,
    ArrowsClockwiseIcon: (props) => {
        const ReactInterno = require('react');
        const { View } = require('react-native');
        return ReactInterno.createElement(View, { testID: 'icone-sincronizar', ...props });
    },
    InfoIcon: (props) => {
        const ReactInterno = require('react');
        const { View } = require('react-native');
        return ReactInterno.createElement(View, { testID: 'icone-legenda', ...props });
    }
}));

jest.mock('../../../../src/shared/components/common/FloatingActionButton', () => {
    const ReactInterno = require('react');
    const { Pressable, Text } = require('react-native');

    return {
        FloatingActionButton: ({
            rotuloAcessibilidade,
            aoPressionar,
            deslocamentoInferior,
            testID
        }) =>
            ReactInterno.createElement(
                Pressable,
                {
                    testID,
                    accessibilityRole: 'button',
                    accessibilityLabel: rotuloAcessibilidade,
                    onPress: aoPressionar,
                    deslocamentoInferior
                },
                ReactInterno.createElement(Text, null, rotuloAcessibilidade)
            )
    };
});

jest.mock(
    '../../../../src/shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar',
    () => {
        const ReactInterno = require('react');
        const { Pressable, Text, View } = require('react-native');

        return {
            BottomTabBar: ({ abaAtiva, onSelecionar }) =>
                ReactInterno.createElement(
                    View,
                    { testID: 'bottom-tab-bar' },
                    ReactInterno.createElement(Text, null, `Aba ativa: ${abaAtiva}`),
                    ReactInterno.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Abrir configurações pelo menu',
                            onPress: () => onSelecionar?.('configuracoes')
                        },
                        ReactInterno.createElement(Text, null, 'Configurações')
                    )
                )
        };
    }
);

jest.mock('../../../../src/features/calendar/components/CycleCalendar/CycleCalendar', () => {
    const ReactInterno = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        CycleCalendar: ({ carregando, aoPressionarDia }) =>
            ReactInterno.createElement(
                View,
                { testID: 'cycle-calendar' },
                ReactInterno.createElement(
                    Text,
                    null,
                    carregando ? 'Carregando calendário' : 'Calendário pronto'
                ),
                aoPressionarDia
                    ? ReactInterno.createElement(Pressable, {
                          accessibilityRole: 'button',
                          accessibilityLabel: 'Dia menstrual registrado',
                          onPress: () => aoPressionarDia({ data: '2026-10-04', registroCicloId: 9 })
                      })
                    : null
            )
    };
});

jest.mock('../../../../src/features/calendar/components/CycleLegendSheet/CycleLegendSheet', () => {
    const ReactInterno = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        CycleLegendSheet: ({ visivel, aoFechar, itens }) =>
            visivel
                ? ReactInterno.createElement(
                      View,
                      { testID: 'cycle-legend-sheet' },
                      ReactInterno.createElement(Text, null, `Itens: ${itens.length}`),
                      ReactInterno.createElement(
                          Pressable,
                          {
                              accessibilityRole: 'button',
                              accessibilityLabel: 'Fechar painel',
                              onPress: aoFechar
                          },
                          ReactInterno.createElement(Text, null, 'Fechar')
                      )
                  )
                : null
    };
});

jest.mock('../../../../src/features/cycles/components/sheets/CycleConfidenceSheet', () => {
    const ReactInterno = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        CycleConfidenceSheet: ({ visivel, nivel, aoFechar }) =>
            visivel
                ? ReactInterno.createElement(
                      View,
                      { testID: 'cycle-confidence-sheet' },
                      ReactInterno.createElement(Text, null, `Confiança: ${nivel}`),
                      ReactInterno.createElement(
                          Pressable,
                          {
                              accessibilityRole: 'button',
                              accessibilityLabel: 'Fechar explicação',
                              onPress: aoFechar
                          },
                          ReactInterno.createElement(Text, null, 'Fechar')
                      )
                  )
                : null
    };
});

describe('CalendarScreen', () => {
    test('mostra calendário, título e confiança', async () => {
        const aoCadastrarMenstruacao = jest.fn();
        const aoEditarCiclo = jest.fn();

        await render(
            <CalendarScreen
                meses={[{ mes: '2026-10', possuiCiclos: true }]}
                confianca="alta"
                aoVoltar={jest.fn()}
                aoCadastrarMenstruacao={aoCadastrarMenstruacao}
                aoEditarCiclo={aoEditarCiclo}
            />
        );

        expect(screen.getByText('Calendário')).toBeOnTheScreen();
        expect(screen.getByTestId('cycle-calendar')).toBeOnTheScreen();
        expect(screen.getByTestId('confidence-badge')).toHaveTextContent('alta');
        const cabecalho = within(screen.getByTestId('header-content'));
        expect(cabecalho.getByText('Calendário')).toBeOnTheScreen();
        expect(cabecalho.getByTestId('confidence-badge')).toBeOnTheScreen();
        expect(screen.getByTestId('header-content')).toHaveStyle({
            flexDirection: 'row',
            justifyContent: 'space-between'
        });
        expect(screen.queryByTestId('status-sincronizacao-calendario')).toBeNull();
        expect(screen.getByRole('button', { name: 'Cadastrar menstruação' })).toBeOnTheScreen();
        expect(screen.getByTestId('bottom-tab-bar')).toBeOnTheScreen();
        expect(screen.getByText('Aba ativa: calendario')).toBeOnTheScreen();
        expect(estilos.areaSincronizacao).toMatchObject({
            position: 'absolute',
            bottom: 0,
            zIndex: 5,
            paddingHorizontal: 15.33
        });

        await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar menstruação' }));
        expect(aoCadastrarMenstruacao).toHaveBeenCalledTimes(1);
        await fireEvent.press(screen.getByRole('button', { name: 'Dia menstrual registrado' }));
        expect(aoEditarCiclo).toHaveBeenCalledWith({
            data: '2026-10-04',
            registroCicloId: 9
        });
        expect(screen.getByTestId('icone-legenda')).toHaveProp('size', 32);
        expect(screen.getByTestId('icone-legenda')).toHaveProp('color', '#2C4C3B');
    });

    test('abre e fecha a legenda pelo botão de informação', async () => {
        await render(
            <CalendarScreen
                meses={[{ mes: '2026-10', possuiCiclos: true }]}
                confianca="media"
                aoVoltar={jest.fn()}
            />
        );

        await fireEvent.press(screen.getByRole('button', { name: 'Abrir legenda do calendário' }));

        expect(await screen.findByText('Itens: 10')).toBeOnTheScreen();

        await fireEvent.press(screen.getByRole('button', { name: 'Fechar painel' }));

        await waitFor(() => {
            expect(screen.queryByTestId('cycle-legend-sheet')).toBeNull();
        });
    });

    test('encaminha a navegação selecionada no menu inferior', async () => {
        const onSelecionarAba = jest.fn();

        await render(
            <CalendarScreen
                meses={[{ mes: '2026-10', possuiCiclos: true }]}
                confianca="alta"
                onSelecionarAba={onSelecionarAba}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', { name: 'Abrir configurações pelo menu' })
        );

        expect(onSelecionarAba).toHaveBeenCalledWith('configuracoes');
    });

    test('abre e fecha a explicação pela tag de confiabilidade', async () => {
        await render(
            <CalendarScreen meses={[{ mes: '2026-10', possuiCiclos: true }]} confianca="alta" />
        );

        await fireEvent.press(
            screen.getByRole('button', { name: 'Explicar confiabilidade do calendário' })
        );

        expect(screen.getByText('Confiança: alta')).toBeOnTheScreen();

        await fireEvent.press(screen.getByRole('button', { name: 'Fechar explicação' }));

        await waitFor(() => {
            expect(screen.queryByTestId('cycle-confidence-sheet')).toBeNull();
        });
    });

    test('mostra falha de sincronização, permite tentar novamente e desloca o FAB', async () => {
        const aoTentarSincronizar = jest.fn();

        await render(
            <CalendarScreen
                meses={[{ mes: '2026-10', possuiCiclos: true }]}
                confianca="alta"
                aoCadastrarMenstruacao={jest.fn()}
                statusSincronizacao="falha"
                erroSincronizacao={{
                    status: 503,
                    mensagemUsuario: 'Alterações salvas neste aparelho. Falha na sincronização.'
                }}
                aoTentarSincronizar={aoTentarSincronizar}
            />
        );

        expect(screen.getByTestId('status-sincronizacao-calendario')).toBeOnTheScreen();
        expect(
            screen.getByText('Alterações salvas neste aparelho. Falha na sincronização.')
        ).toBeOnTheScreen();

        await fireEvent.press(screen.getByRole('button', { name: 'Tentar sincronizar novamente' }));

        expect(aoTentarSincronizar).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('calendar-add-fab')).toHaveProp('deslocamentoInferior', 76);
        expect(screen.getByTestId('sync-status-calendar')).toHaveStyle({
            maxWidth: 351,
            height: 64,
            backgroundColor: '#FBF3E0'
        });
    });

    test('mostra o estado vazio e chama o atalho de cadastro', async () => {
        const aoCadastrarMenstruacao = jest.fn();

        await render(
            <CalendarScreen
                meses={[{ mes: '2026-10', possuiCiclos: false }]}
                confianca="baixa"
                aoVoltar={jest.fn()}
                aoCadastrarMenstruacao={aoCadastrarMenstruacao}
            />
        );

        expect(
            screen.getByText(/Você ainda não possui nenhum ciclo registrado/u)
        ).toBeOnTheScreen();
        expect(screen.getByText("'+'")).toBeOnTheScreen();
        expect(screen.queryByText("'Cadastrar Menstruação'")).toBeNull();
        expect(screen.getByTestId('calendar-empty-state')).toHaveStyle({
            display: 'flex',
            width: '100%',
            maxWidth: 349.991,
            paddingVertical: 10,
            paddingHorizontal: 12,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 9,
            borderRadius: 12,
            backgroundColor: '#E3E4DE',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 6
        });
        expect(estilos.avisoVazio.borderWidth).toBeUndefined();
        expect(estilos.avisoVazio.borderColor).toBeUndefined();
        expect(screen.getByTestId('cycle-calendar')).toBeOnTheScreen();
        expect(
            within(screen.getByTestId('calendar-empty-state')).queryByTestId('icone-legenda')
        ).toBeNull();
        expect(
            within(screen.getByTestId('calendar-empty-state')).getByText(
                /Você ainda não possui nenhum ciclo registrado/u
            )
        ).toHaveStyle({ width: '100%', textAlign: 'center' });
        expect(screen.getByTestId('confidence-badge')).toHaveTextContent('baixa');
        expect(screen.getAllByRole('button', { name: 'Cadastrar menstruação' })).toHaveLength(1);

        await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar menstruação' }));

        expect(aoCadastrarMenstruacao).toHaveBeenCalledTimes(1);
    });

    test('oculta o aviso ao tocar na tela e o reapresenta após cinco segundos sem interação', async () => {
        jest.useFakeTimers();

        try {
            await render(
                <CalendarScreen
                    meses={[{ mes: '2026-10', possuiCiclos: false }]}
                    aoCadastrarMenstruacao={jest.fn()}
                />
            );

            expect(
                screen.getByTestId('calendar-empty-state', { includeHiddenElements: true })
            ).toHaveProp('accessibilityElementsHidden', false);

            await fireEvent(screen.getByTestId('calendar-screen'), 'touchStart');
            expect(
                screen.getByTestId('calendar-empty-state', { includeHiddenElements: true })
            ).toHaveProp('accessibilityElementsHidden', true);

            await act(async () => {
                await jest.advanceTimersByTimeAsync(TEMPO_REAPARECER_AVISO_MS - 1);
            });
            expect(
                screen.getByTestId('calendar-empty-state', { includeHiddenElements: true })
            ).toHaveProp('accessibilityElementsHidden', true);

            await act(async () => {
                await jest.advanceTimersByTimeAsync(1);
            });
            expect(
                screen.getByTestId('calendar-empty-state', { includeHiddenElements: true })
            ).toHaveProp('accessibilityElementsHidden', false);
        } finally {
            jest.useRealTimers();
        }
    });

    test('mostra o erro e tenta carregar novamente', async () => {
        const aoTentarNovamente = jest.fn();

        await render(
            <CalendarScreen
                meses={[{ mes: '2026-10', possuiCiclos: true }]}
                confianca="alta"
                erro="Não foi possível carregar os dados do calendário. Tente novamente."
                aoVoltar={jest.fn()}
                aoTentarNovamente={aoTentarNovamente}
            />
        );

        expect(screen.getByTestId('calendar-error-state')).toHaveStyle({
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: 76
        });
        expect(screen.getByText('Ocorreu um erro')).toBeOnTheScreen();
        expect(
            screen.getByText('Não foi possível carregar os dados do calendário. Tente novamente.')
        ).toBeOnTheScreen();
        expect(screen.queryByTestId('cycle-calendar')).toBeNull();
        expect(screen.queryByTestId('confidence-badge')).toBeNull();
        expect(screen.queryByTestId('calendar-add-fab')).toBeNull();

        await fireEvent.press(screen.getByRole('button', { name: 'Tentar Novamente' }));

        expect(aoTentarNovamente).toHaveBeenCalledTimes(1);
    });

    test('mantém o estado de erro enquanto a falha continuar presente', async () => {
        const props = {
            meses: [{ mes: '2026-10', possuiCiclos: true }],
            confianca: 'alta',
            aoTentarNovamente: jest.fn()
        };
        const mensagem = 'Não foi possível carregar os dados do calendário. Tente novamente.';
        const { rerender } = await render(<CalendarScreen {...props} erro={mensagem} />);

        expect(screen.getByTestId('calendar-error-state')).toBeOnTheScreen();
        await rerender(<CalendarScreen {...props} erro={mensagem} />);
        expect(screen.getByTestId('calendar-error-state')).toBeOnTheScreen();

        await rerender(<CalendarScreen {...props} />);
        expect(screen.queryByTestId('calendar-error-state')).toBeNull();
    });

    test('ignora confiança desconhecida', async () => {
        await render(
            <CalendarScreen
                meses={[{ mes: '2026-10', possuiCiclos: true }]}
                confianca="desconhecida"
            />
        );

        expect(screen.queryByTestId('confidence-badge')).toBeNull();
    });
});
