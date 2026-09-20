import { fireEvent, render, screen } from '@testing-library/react-native';
import Button from '../components/common/Button/Button';
import ButtonPopup from '../components/common/Button/ButtonPopup';
import ButtonDashed from '../components/common/Button/ButtonDashed';

test('botão chama a ação ao toque', async () => {
    const aoPressionar = jest.fn();
    await render(<Button texto="Salvar" aoPressionar={aoPressionar} />);
    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(aoPressionar).toHaveBeenCalledTimes(1);
});

test.each([['desativado', { desativado: true }], ['carregando', { carregando: true }]])(
    'botão %s bloqueia a ação', async (_, estado) => {
        const aoPressionar = jest.fn();
        await render(<Button texto="Salvar" aoPressionar={aoPressionar} {...estado} />);
        const botao = screen.getByRole('button', { name: 'Salvar' });
        fireEvent.press(botao);
        expect(aoPressionar).not.toHaveBeenCalled();
        expect(botao.props.accessibilityState.disabled).toBe(true);
    }
);

test.each(['verde', 'branco', 'preto', 'vermelho'])(
    'botão de popup aceita a variante %s', async (variante) => {
        await render(<ButtonPopup texto="OK" variante={variante} />);
        expect(screen.getByRole('button', { name: 'OK' })).toBeTruthy();
    }
);

test('botão tracejado executa a ação', async () => {
    const aoPressionar = jest.fn();
    await render(<ButtonDashed texto="Adicionar" aoPressionar={aoPressionar} />);
    fireEvent.press(screen.getByRole('button', { name: 'Adicionar' }));
    expect(aoPressionar).toHaveBeenCalledTimes(1);
});
