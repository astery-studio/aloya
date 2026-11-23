/**
 * Testes da digitação numérica com unidade fixa.
 */
import { fireEvent, screen } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import NumberInput from '../../src/shared/components/forms/NumberInput';
import { renderWithTheme } from '../helpers/renderWithTheme';

test('altera somente o número e mantém a unidade visível', async () => {
    const aoAlterar = jest.fn();
    await renderWithTheme(<NumberInput valor={28} aoAlterar={aoAlterar} />);

    const entrada = screen.getByLabelText('Duração em dias');
    expect(entrada.props.value).toBe('28');
    expect(entrada).toHaveStyle({
        minWidth: 32,
        textAlign: 'center',
        textAlignVertical: 'center'
    });
    expect(screen.getByText('Dias')).toBeTruthy();

    await fireEvent.changeText(entrada, '35 dias');
    expect(aoAlterar).toHaveBeenCalledWith(35);
    expect(screen.getByText('Dias')).toBeTruthy();
});

test('converte um campo apagado para valor nulo', async () => {
    const aoAlterar = jest.fn();
    await renderWithTheme(<NumberInput valor={5} aoAlterar={aoAlterar} />);

    await fireEvent.changeText(screen.getByLabelText('Duração em dias'), '');
    expect(aoAlterar).toHaveBeenCalledWith(null);
});

test('não anuncia zero quando o campo está vazio', async () => {
    await renderWithTheme(<NumberInput valor={null} />);
    expect(screen.getByLabelText('Duração em dias')).toHaveProp('accessibilityValue', {});
});

test('bloqueia e atenua o campo desativado', async () => {
    await renderWithTheme(<NumberInput valor={5} desativado />);
    expect(screen.getByTestId('area-campo-numero')).toBeDisabled();
    expect(screen.getByTestId('area-campo-numero')).toHaveStyle({ opacity: 0.55 });
    expect(screen.getByLabelText('Duração em dias')).toHaveProp('editable', false);
});

test('toda a área numérica pode direcionar o foco', async () => {
    await renderWithTheme(<NumberInput valor={28} aoAlterar={jest.fn()} />);
    await fireEvent.press(screen.getByTestId('area-campo-numero'));
});

test('aceita decimal exato e expõe os limites da temperatura', async () => {
    const aoAlterar = jest.fn();
    await renderWithTheme(
        <NumberInput
            valor="36.5"
            aoAlterar={aoAlterar}
            unidade="°C"
            casasDecimais={1}
            valorMinimo={32}
            valorMaximo={42}
            rotuloAcessibilidade="Temperatura basal"
        />
    );
    const entrada = screen.getByLabelText('Temperatura basal');
    expect(entrada).toHaveProp('value', '36,5');
    expect(entrada).toHaveProp('keyboardType', 'decimal-pad');
    expect(entrada).toHaveProp('accessibilityValue', { min: 32, max: 42, now: 36.5 });
    await fireEvent.changeText(entrada, '37,2');
    expect(aoAlterar).toHaveBeenCalledWith('37,2');
});

test('destaca a unidade e permite limpar um valor preenchido', async () => {
    const aoAlterar = jest.fn();
    const fecharTeclado = jest.spyOn(Keyboard, 'dismiss').mockImplementation(jest.fn());
    await renderWithTheme(
        <NumberInput valor="36,5" aoAlterar={aoAlterar} unidade="°C" permitirLimpar />
    );
    expect(screen.getByText('°C')).toHaveStyle({ fontFamily: 'DMSans_600SemiBold' });
    await fireEvent.press(screen.getByRole('button', { name: 'Limpar Duração em dias' }));
    expect(aoAlterar).toHaveBeenCalledWith(null);
    expect(fecharTeclado).toHaveBeenCalledTimes(1);
    fecharTeclado.mockRestore();
});
