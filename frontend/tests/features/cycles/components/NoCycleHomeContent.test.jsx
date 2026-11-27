import { fireEvent, screen } from '@testing-library/react-native';
import { NoCycleHomeContent } from '../../../../src/features/cycles/components/home/NoCycleHomeContent';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('abre e recolhe um cartão sem mudar o estado dos outros', async () => {
    const aoAbrirAnticoncepcional = jest.fn();
    await render(<NoCycleHomeContent aoAbrirAnticoncepcional={aoAbrirAnticoncepcional} />);

    const ritmo = screen.getByRole('button', { name: /Entenda o ritmo do seu ciclo/ });
    const anticoncepcional = screen.getByRole('button', {
        name: /Acompanhe seu anticoncepcional/
    });

    expect(ritmo.props.accessibilityState.expanded).toBe(false);
    expect(anticoncepcional.props.accessibilityState.expanded).toBe(false);
    await fireEvent.press(ritmo);
    await fireEvent.press(anticoncepcional);

    expect(screen.getByText(/Com registros suficientes/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir Anticoncepcionais' }));
    expect(aoAbrirAnticoncepcional).toHaveBeenCalledTimes(1);

    await fireEvent.press(ritmo);
    expect(screen.queryByText(/Com registros suficientes/)).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir Anticoncepcionais' })).toBeOnTheScreen();
});

test('usa a apresentação de primeiro acesso quando o motivo é desconhecido', async () => {
    await render(<NoCycleHomeContent motivoSemPrevisao="motivo-inesperado" />);
    expect(screen.getByText('Seu ciclo, sua descoberta.')).toBeOnTheScreen();
});

test('usa superfícies escuras e ações com contraste na Home sem ciclo', async () => {
    await render(<NoCycleHomeContent aoCadastrarMenstruacao={jest.fn()} />, {
        preferencia: 'escuro'
    });

    expect(screen.getByTestId('diario-home-sem-ciclo')).toHaveStyle({
        backgroundColor: '#1E1E1E',
        borderColor: 'rgba(255, 255, 255, 0.08)'
    });
    expect(screen.getByText('Seu Diário já está disponível')).toHaveStyle({ color: '#999999' });
    expect(screen.getByText('Cadastrar Menstruação')).toHaveStyle({ color: '#121212' });
});
