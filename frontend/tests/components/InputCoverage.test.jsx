import { fireEvent, render, screen } from '@testing-library/react-native';
import NumberInput from '../../components/forms/NumberInput';
import { horarioValido } from '../../utils/validation/isValidTime';

test.each([null, undefined])('campo numérico representa %s como vazio', async (valor) => {
    await render(<NumberInput valor={valor} unidade="Ciclos"
        rotuloAcessibilidade="Quantidade" desativado />);
    expect(screen.getByLabelText('Quantidade').props.value).toBe('');
    expect(screen.getByLabelText('Quantidade').props.editable).toBe(false);
    expect(screen.getByText('Ciclos')).toBeTruthy();
});

test('campo numérico limita a dois dígitos e aceita ausência de callback', async () => {
    await render(<NumberInput valor={1} />);
    expect(() => fireEvent.changeText(
        screen.getByLabelText('Duração em dias'), '123 letras'
    )).not.toThrow();
});

test.each([
    [null, false], ['9:00', false], ['00:60', false],
    ['23:59', true], ['24:00', false]
])('valida horário %s', (valor, esperado) => {
    expect(horarioValido(valor)).toBe(esperado);
});
