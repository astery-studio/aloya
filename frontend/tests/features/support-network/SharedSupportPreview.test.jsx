import { fireEvent, screen, within } from '@testing-library/react-native';

import { SharedSupportPreview } from '../../../src/features/support-network/testing/SharedSupportPreview';
import { renderWithTheme as render } from '../../helpers/renderWithTheme';

jest.mock('expo-font', () => ({ useFonts: () => [true, null] }));

test('permite conferir os componentes já implementados com dados fictícios', async () => {
    await render(<SharedSupportPreview />);

    expect(screen.getByLabelText('Acompanhando Júlia')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Fase Folicular' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Prévia da arte: Sem ciclo' }));
    expect(screen.getByTestId('supported-cycle-artwork-empty')).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: 'Fase Folicular' })).not.toBeOnTheScreen();
    expect(screen.getByText('Entenda cada fase')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Ver Anticoncepcionais' }));
    expect(screen.getByText('Yaz')).toBeOnTheScreen();
    expect(screen.getByText('Mirena')).toBeOnTheScreen();
    await fireEvent.press(screen.getAllByRole('button', { name: 'Histórico de uso' })[0]);
    expect(screen.getByText('Setembro 2026')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Ver Histórico de Ciclos' }));
    expect(screen.getByText('RESUMO DOS CICLOS DE JÚLIA')).toBeOnTheScreen();
    expect(screen.getAllByTestId('cycle-history-card')).toHaveLength(2);
    await fireEvent(screen.getByTestId('cycle-history-list'), 'onEndReached');
    expect(screen.getAllByTestId('cycle-history-card')).toHaveLength(3);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Ver Diário' }));
    expect(screen.getByText('RESUMO DO DIÁRIO DE JÚLIA')).toBeOnTheScreen();
    expect(screen.getByText('Fase Folicular')).toBeOnTheScreen();
    expect(screen.getAllByTestId('diary-entry-card')).toHaveLength(2);
    expect(screen.getByText('Hoje tirei um tempo para descansar.')).toBeOnTheScreen();
    expect(screen.queryByTestId('diary-entry-header-actions')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: /Abrir registro de 04\/11\/2026/ }));
    expect(screen.getByRole('header', { name: 'Diário de Júlia' })).toBeOnTheScreen();
    expect(screen.getByText('No dia 01 do ciclo 04 Júlia registrou:')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Próximo dia' })).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Dia anterior' }));
    expect(screen.getByText('No dia 21 do ciclo 03 Júlia registrou:')).toBeOnTheScreen();
    expect(screen.getByText('Espinhas')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(screen.queryByRole('header', { name: 'Diário de Júlia' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Filtrar histórico do Diário' }));
    await fireEvent.press(
        await screen.findByRole('switch', { name: 'Filtrar por Fase Folicular' })
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar Filtro' }));
    expect(screen.getByText('FILTRO APLICADO (0)')).toBeOnTheScreen();
    expect(
        screen.getByText('Nenhum registro encontrado para os filtros aplicados.')
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getAllByTestId('diary-entry-card')).toHaveLength(2);

    await fireEvent.press(screen.getByRole('button', { name: 'Filtrar histórico do Diário' }));
    await fireEvent.press(
        await screen.findByRole('button', { name: 'Expandir Corpo e Sintomas Físicos' })
    );
    await fireEvent.press(screen.getByRole('switch', { name: 'Filtrar por Pele' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar Filtro' }));
    expect(screen.getByText('FILTRO APLICADO (1)')).toBeOnTheScreen();
    expect(screen.getAllByTestId('diary-entry-card')).toHaveLength(1);
});

test('mostra o histórico compartilhado vazio e permite recuperar de um erro', async () => {
    await render(<SharedSupportPreview />);

    await fireEvent.press(screen.getByRole('button', { name: 'Histórico vazio' }));
    expect(screen.getByText('Ainda não há dados suficientes para exibir aqui.')).toBeOnTheScreen();
    expect(screen.queryByText('RESUMO DOS CICLOS DE JÚLIA')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Erro no histórico' }));
    expect(
        screen.getByText('Não foi possível carregar histórico de ciclos. Tente novamente.')
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Tentar Novamente' }));
    expect(screen.getByText('RESUMO DOS CICLOS DE JÚLIA')).toBeOnTheScreen();
});

test('permite testar o calendário, a legenda, o estado vazio e a nova tentativa', async () => {
    await render(<SharedSupportPreview />);

    await fireEvent.press(screen.getByRole('button', { name: 'Ver Calendário' }));
    expect(await screen.findByTestId('cycle-calendar-list')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Calendário', selected: true })).toBeOnTheScreen();
    expect(screen.queryByTestId('calendar-add-fab')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir legenda do calendário' }));
    expect(await screen.findByTestId('item-legenda-lutea-prevista')).toBeOnTheScreen();
    await fireEvent.press(
        within(screen.getByTestId('bottom-sheet-cabecalho')).getByRole('button', {
            name: 'Fechar painel'
        })
    );
    await fireEvent.press(screen.getByRole('tab', { name: 'Início' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Calendário sem previsões' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir legenda do calendário' }));
    expect(await screen.findByTestId('item-legenda-menstruacao-real')).toBeOnTheScreen();
    expect(screen.queryByTestId('item-legenda-lutea-prevista')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('bottom-sheet-area-fundo'));
    await fireEvent.press(screen.getByRole('tab', { name: 'Início' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Calendário vazio' }));
    expect(await screen.findByText('Nada para exibir')).toBeOnTheScreen();
    expect(screen.queryByTestId('cycle-calendar-list')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('tab', { name: 'Início' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Erro no calendário' }));
    expect(await screen.findByTestId('calendar-error-state')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar Novamente' }));
    expect(await screen.findByTestId('cycle-calendar-list')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Diário' }));
    expect(screen.getByText('RESUMO DO DIÁRIO DE JÚLIA')).toBeOnTheScreen();
});
