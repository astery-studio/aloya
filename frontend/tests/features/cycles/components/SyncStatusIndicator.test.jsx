import { fireEvent, screen } from '@testing-library/react-native';
import { SyncStatusIndicator } from '../../../../src/features/cycles/components/SyncStatusIndicator';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('oculta estados ausentes e sincronizado por padrão', async () => {
    const tela = await render(<SyncStatusIndicator />);
    expect(screen.queryByText('Alterações sincronizadas.')).toBeNull();
    await tela.rerender(<SyncStatusIndicator status="sincronizado" />);
    expect(screen.queryByText('Alterações sincronizadas.')).toBeNull();
    await tela.rerender(<SyncStatusIndicator status="sincronizado" mostrarSincronizado />);
    expect(screen.getByText('Alterações sincronizadas.')).toBeOnTheScreen();
});

test('comunica andamento, pendência e falha por texto e oferece retentativa', async () => {
    const retry = jest.fn();
    const tela = await render(<SyncStatusIndicator status="sincronizando" />);
    expect(screen.getByLabelText('Sincronizando')).toBeOnTheScreen();
    await tela.rerender(<SyncStatusIndicator status="pendente" />);
    expect(screen.getByText(/Sincronização pendente/)).toBeOnTheScreen();
    await tela.rerender(
        <SyncStatusIndicator status="falha" mensagem="Salvo offline" onTentarNovamente={retry} />
    );
    expect(screen.getByText('Salvo offline')).toBeOnTheScreen();
    expect(retry).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar sincronizar novamente' }));
    expect(retry).toHaveBeenCalledTimes(1);
});

test('apresenta a variante flutuante do calendário', async () => {
    const retry = jest.fn();

    await render(
        <SyncStatusIndicator
            variante="calendario"
            status="falha"
            mensagem="Alterações salvas neste aparelho. Falha na sincronização."
            onTentarNovamente={retry}
        />
    );

    expect(screen.getByTestId('sync-status-calendar')).toHaveStyle({
        width: '100%',
        maxWidth: 351,
        height: 64,
        paddingVertical: 10,
        paddingHorizontal: 13,
        gap: 10,
        borderRadius: 12,
        backgroundColor: '#FBF3E0'
    });
    expect(screen.getByTestId('sync-status-calendar-message')).toHaveStyle({
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 19,
        textAlign: 'center',
        color: '#B07D2A'
    });
    expect(screen.getByText('Falha na sincronização.')).toHaveStyle({
        fontWeight: '700'
    });
    expect(screen.getByRole('button', { name: 'Tentar sincronizar novamente' })).toHaveStyle({
        width: 44,
        height: 44,
        borderWidth: 0.666667,
        borderColor: '#E8C97A',
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.5)'
    });
});
