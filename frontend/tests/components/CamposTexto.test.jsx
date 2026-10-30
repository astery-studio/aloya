/**
 * Testes dos campos de texto, e-mail e senha e de suas interações.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { TextInput as EntradaNativa } from 'react-native';
import { renderWithTheme as render } from '../helpers/renderWithTheme';
import TextInput from '../../src/shared/components/forms/TextInput';
import EmailInput from '../../src/shared/components/forms/EmailInput';
import PasswordInput from '../../src/shared/components/forms/PasswordInput';

afterEach(() => jest.restoreAllMocks());

test('campo de texto entrega o valor digitado', async () => {
    const aoMudar = jest.fn();
    await render(<TextInput label="Nome" placeholder="Nome" value="" onChangeText={aoMudar} />);
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Julia');
    expect(aoMudar).toHaveBeenCalledWith('Julia');
});

test('toda a área do campo textual pode direcionar o foco', async () => {
    const focar = jest.spyOn(EntradaNativa.prototype, 'focus').mockClear();
    await render(<TextInput label="Nome" value="" onChangeText={jest.fn()} />);
    await fireEvent.press(screen.getByTestId('area-campo-texto'));
    expect(focar).toHaveBeenCalledTimes(1);
});

test('campo desativado não permite edição', async () => {
    const focar = jest.spyOn(EntradaNativa.prototype, 'focus').mockClear();
    await render(<TextInput label="Nome" value="Julia" desativado />);
    expect(screen.getByLabelText('Nome').props.editable).toBe(false);
    expect(screen.getByTestId('area-campo-texto')).toBeDisabled();
    await fireEvent.press(screen.getByTestId('area-campo-texto'));
    expect(focar).not.toHaveBeenCalled();
});

test('e-mail remove espaços e caracteres de controle', async () => {
    const aoMudar = jest.fn();
    await render(<EmailInput value="" onChangeText={aoMudar} />);
    await fireEvent.changeText(screen.getByLabelText('Email'), '  teste@exemplo.com\n ');
    expect(aoMudar).toHaveBeenCalledWith('teste@exemplo.com');
});

test('senha começa oculta e pode ser exibida', async () => {
    await render(<PasswordInput value="segredo" onChangeText={jest.fn()} />);
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha' }));
    await waitFor(() => expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(false));
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeTruthy();
});

test('campo categoria exibe rótulo externo e aplica sanitização', async () => {
    const aoMudar = jest.fn();
    await render(
        <TextInput
            label="Categoria"
            placeholder="Escolha"
            value=""
            variante="categoria"
            onChangeText={aoMudar}
            sanitizar={(texto) => texto.toUpperCase()}
        />
    );
    expect(screen.getByText('Categoria')).toBeTruthy();
    expect(screen.getByTestId('area-campo-texto')).toHaveTextContent('Categoria');
    await fireEvent.changeText(screen.getByLabelText('Categoria'), 'ciclo');
    expect(aoMudar).toHaveBeenCalledWith('CICLO');
});

test('campo popup aceita ação lateral e mensagem de erro', async () => {
    await render(
        <TextInput
            placeholder="Código"
            value=""
            variante="popup"
            erro="Código inválido"
            acaoDireita={<TextInput label="Ação" value="" />}
        />
    );
    expect(screen.getByLabelText('Código')).toBeTruthy();
    expect(screen.getByLabelText('Ação')).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveTextContent('Código inválido');
});

test('campos usam as cores do modo escuro', async () => {
    await render(<TextInput label="Nome" placeholder="Nome" value="Julia" />, {
        preferencia: 'escuro'
    });

    const campo = screen.getByLabelText('Nome');

    expect(campo).toHaveStyle({ color: '#F4F1EA' });
    expect(campo).toHaveProp('placeholderTextColor', '#C4C8C5');
    expect(campo).toHaveProp('selectionColor', '#9FD6B6');
});
