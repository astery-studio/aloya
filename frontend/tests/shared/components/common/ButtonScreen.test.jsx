//Testa os estados ativo, desativado e carregando do ButtonScreen.
import { fireEvent, screen } from '@testing-library/react-native';
import ButtonScreen from '../../../../src/shared/components/common/Button/ButtonScreen';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

test('executa a ação quando está ativo', async () => {
    const aoPressionar = jest.fn();

    await renderWithTheme(<ButtonScreen texto="Salvar" aoPressionar={aoPressionar} />);

    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(aoPressionar).toHaveBeenCalledTimes(1);
});

test('bloqueia a ação quando está desativado', async () => {
    const aoPressionar = jest.fn();

    await renderWithTheme(<ButtonScreen texto="Avançar" aoPressionar={aoPressionar} desativado />);

    const botao = screen.getByRole('button', { name: 'Avançar' });

    fireEvent.press(botao);

    expect(aoPressionar).not.toHaveBeenCalled();
    expect(botao).toBeDisabled();
});

test('bloqueia a ação e informa carregamento', async () => {
    const aoPressionar = jest.fn();

    await renderWithTheme(<ButtonScreen texto="Entrar" aoPressionar={aoPressionar} carregando />);

    const botao = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.press(botao);

    expect(aoPressionar).not.toHaveBeenCalled();
    expect(botao).toBeDisabled();
    expect(botao.props.accessibilityState.busy).toBe(true);
});

test('fica desativado quando não recebe uma ação', async () => {
    await renderWithTheme(<ButtonScreen texto="Confirmar" />);

    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
});

test.each(['laranja', 'verde', 'vermelho', 'bordaLaranja', 'bordaVerde'])('aceita a variante %s', async (variante) => {
    await renderWithTheme(<ButtonScreen texto="Cadastrar anticoncepcional" variante={variante} aoPressionar={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Cadastrar anticoncepcional' })).toBeOnTheScreen();
});

test('usa destaque e contraste do modo escuro', async () => {
    await renderWithTheme(
        <ButtonScreen texto="Continuar" variante="verde" aoPressionar={jest.fn()} />,
        { preferencia: 'escuro' }
    );

    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveStyle({
        backgroundColor: '#9FD6B6'
    });
    expect(screen.getByText('Continuar')).toHaveStyle({ color: '#152018' });
});
