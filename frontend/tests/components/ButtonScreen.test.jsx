//Testa os estados ativo, desativado e carregando do ButtonScreen.
import { fireEvent, render, screen } from '@testing-library/react-native';
import ButtonScreen from '../../components/common/Button/ButtonScreen';

test('executa a ação quando está ativo', async () => {
    const aoPressionar = jest.fn();

    await render(<ButtonScreen texto="Salvar" aoPressionar={aoPressionar} />);

    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(aoPressionar).toHaveBeenCalledTimes(1);
});

test('bloqueia a ação quando está desativado', async () => {
    const aoPressionar = jest.fn();

    await render(<ButtonScreen texto="Avançar" aoPressionar={aoPressionar} desativado />);

    const botao = screen.getByRole('button', { name: 'Avançar' });

    fireEvent.press(botao);

    expect(aoPressionar).not.toHaveBeenCalled();
    expect(botao).toBeDisabled();
});

test('bloqueia a ação e informa carregamento', async () => {
    const aoPressionar = jest.fn();

    await render(<ButtonScreen texto="Entrar" aoPressionar={aoPressionar} carregando />);

    const botao = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.press(botao);

    expect(aoPressionar).not.toHaveBeenCalled();
    expect(botao).toBeDisabled();
    expect(botao.props.accessibilityState.busy).toBe(true);
});

test('fica desativado quando não recebe uma ação', async () => {
    await render(<ButtonScreen texto="Confirmar" />);

    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
});

test.each(['laranja', 'verde', 'vermelho', 'bordaLaranja', 'bordaVerde'])('aceita a variante %s', async (variante) => {
    await render(<ButtonScreen texto="Cadastrar anticoncepcional" variante={variante} aoPressionar={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Cadastrar anticoncepcional' })).toBeOnTheScreen();
});