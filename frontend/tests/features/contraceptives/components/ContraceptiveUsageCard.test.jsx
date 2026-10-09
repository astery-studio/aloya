import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ContraceptiveUsageCard } from '../../../../src/features/contraceptives/components/ContraceptiveUsageCard';

test('exibe os dados, horários e ações do cartão', async () => {
    const aoEditar = jest.fn();
    const aoRemover = jest.fn();
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Yaz', tipo: 'pilula', intensidadeAlerta: 'moderado', usoAtrasado: true,
        programacao: { horarios: ['08:00', '20:00'] }, historico: []
    }} aoEditar={aoEditar} aoRemover={aoRemover} />);

    expect(screen.getByText('PRÓXIMOS HORÁRIOS')).toBeOnTheScreen();
    expect(screen.getByText('08:00')).toBeOnTheScreen();
    expect(screen.getByText('20:00')).toBeOnTheScreen();
    expect(screen.getByText('Alerta Moderado')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Editar Yaz' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Remover Yaz' }));
    expect(aoEditar).toHaveBeenCalledTimes(1);
    expect(aoRemover).toHaveBeenCalledTimes(1);
});

test('marca e reverte o uso quando a persistência falha', async () => {
    const aoAlternarUso = jest.fn().mockRejectedValue(new Error('rede'));
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Evra', tipo: 'adesivo', intensidadeAlerta: 'leve',
        usosHoje: [{ id: 'u1', horario: '09:30', status: 'pendente' }], historico: []
    }} aoAlternarUso={aoAlternarUso} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Uso' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Marcar Uso' })).toBeOnTheScreen());
    expect(aoAlternarUso).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }), expect.objectContaining({ id: 'u1' }), true);
});
