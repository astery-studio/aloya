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
