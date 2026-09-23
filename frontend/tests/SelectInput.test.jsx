/**
 * Testes de apresentação e interação do campo de seleção.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import SelectInput from '../components/forms/SelectInput';

test('exibe valor com unidade e abre a seleção', async () => {
    const aoPressionar = jest.fn();
    await render(<SelectInput valor={28} unidade="dias"
        aoPressionar={aoPressionar} />);

    const campo = screen.getByRole('button', { name: 'Selecionar opção' });
    expect(campo).toHaveAccessibilityValue({ text: '28 dias' });
    expect(screen.getByText('28 dias')).toBeTruthy();
    fireEvent.press(campo);
    expect(aoPressionar).toHaveBeenCalledTimes(1);
});

test('exibe placeholder e respeita o estado desativado', async () => {
    const aoPressionar = jest.fn();
    await render(<SelectInput placeholder="Escolha" desativado
        aoPressionar={aoPressionar} />);

    const campo = screen.getByRole('button', { name: 'Selecionar opção' });
    expect(campo).toBeDisabled();
    expect(screen.getByText('Escolha')).toBeTruthy();
    fireEvent.press(campo);
    expect(aoPressionar).not.toHaveBeenCalled();
});
