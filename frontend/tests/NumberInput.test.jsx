/**
 * Testes da digitação numérica com unidade fixa.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import NumberInput from '../components/forms/NumberInput';

test('altera somente o número e mantém a unidade visível', async () => {
    const aoAlterar = jest.fn();
    await render(<NumberInput valor={28} aoAlterar={aoAlterar} />);

    const entrada = screen.getByLabelText('Duração em dias');
    expect(entrada.props.value).toBe('28');
    expect(screen.getByText('Dias')).toBeTruthy();

    fireEvent.changeText(entrada, '35 dias');
    expect(aoAlterar).toHaveBeenCalledWith(35);
    expect(screen.getByText('Dias')).toBeTruthy();
});

test('converte um campo apagado para valor nulo', async () => {
    const aoAlterar = jest.fn();
    await render(<NumberInput valor={5} aoAlterar={aoAlterar} />);

    fireEvent.changeText(screen.getByLabelText('Duração em dias'), '');
    expect(aoAlterar).toHaveBeenCalledWith(null);
});
