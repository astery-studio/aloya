import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';
import { CycleEditSheet } from '../../../../src/features/cycles/components/CycleEditSheet/CycleEditSheet';
jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => ({
    BottomSheet: ({ visivel, children }) => (visivel ? children : null)
}));
const props = {
    visivel: true,
    mesInicial: '2026-08',
    meses: [{ mes: '2026-08', diasMenstruacao: [{ data: '2026-08-23' }] }],
    onAlternarDia: jest.fn(),
    onSalvar: jest.fn(),
    onFechar: jest.fn()
};
test('segue o protótipo com calendário, instrução e Concluir desativado inicialmente', async () => {
    await render(<CycleEditSheet {...props} alterado={false} />);
    expect(screen.getByText('Editar Menstruação')).toBeOnTheScreen();
    expect(screen.getByText('Clique em um dia para alterar seu estado.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Concluir' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Descartar Alterações' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Desmarcar dia 2026-08-23' })).toHaveProp(
        'accessibilityState',
        { disabled: false, selected: true }
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Marcar dia 2026-08-22' }));
    expect(props.onAlternarDia).toHaveBeenCalledWith({ data: '2026-08-22' });
});
test('Concluir ativo após mudança e bloqueado durante gravação', async () => {
    const tela = await render(<CycleEditSheet {...props} alterado />);
    await fireEvent.press(screen.getByRole('button', { name: 'Concluir' }));
    expect(props.onSalvar).toHaveBeenCalled();
    await tela.rerender(<CycleEditSheet {...props} alterado salvando />);
    expect(screen.getByRole('button', { name: 'Concluir' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Marcar dia 2026-08-22' })).toBeDisabled();
});

test('Concluir fica bloqueado enquanto carrega a seleção persistida', async () => {
    const onSalvar = jest.fn();
    await render(<CycleEditSheet {...props} alterado carregando onSalvar={onSalvar} />);
    expect(screen.getByRole('button', { name: 'Concluir' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Concluir' }));
    expect(onSalvar).not.toHaveBeenCalled();
});

test.each([false, true])(
    'editor noturno preserva seleção e estado de Concluir (alterado: %s)',
    async (alterado) => {
        await render(<CycleEditSheet {...props} alterado={alterado} />, { preferencia: 'escuro' });
        const concluir = screen.getByRole('button', { name: 'Concluir' });
        expect(concluir).toHaveStyle({
            backgroundColor: alterado ? '#C26E5F' : '#2C2C2C',
            height: 48
        });
        expect(screen.getByText('Concluir')).toHaveStyle({
            color: alterado ? '#121212' : '#757575'
        });
        expect(screen.getByRole('button', { name: 'Descartar Alterações' })).toHaveStyle({
            backgroundColor: '#242424',
            height: 54
        });
        expect(screen.getByRole('button', { name: 'Desmarcar dia 2026-08-23' })).toHaveStyle({
            borderStyle: 'dashed',
            borderColor: '#EF9A9A'
        });
        if (alterado) expect(concluir).toBeEnabled();
        else expect(concluir).toBeDisabled();
    }
);
