/**
 * Exercita variantes opcionais dos componentes de formulário da Carla.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import ButtonPopup from '../../components/common/Button/ButtonPopup';
import FormField from '../../components/forms/FormField';
import TextInput from '../../components/forms/TextInput';
import TimeInput from '../../components/forms/TimeInput';

test('ButtonPopup rejeita variante fora do contrato', () => {
    expect(() => ButtonPopup({
        texto: 'Continuar',
        variante: 'inexistente'
    })).toThrow('Variante de ButtonPopup inválida: inexistente');
});

test('ButtonPopup usa variante padrão quando ela é omitida', async () => {
    await render(<ButtonPopup texto="Continuar" />);
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeTruthy();
});

test('FormField aceita conteúdo, título e mensagem auxiliar', async () => {
    await render(
        <FormField label="Dados" tituloSecao mensagemAuxiliar="Obrigatório">
            <TextInput label="Nome" value="Carla" />
        </FormField>
    );

    expect(screen.getByRole('header', { name: 'Dados' })).toBeTruthy();
    expect(screen.getByText('Obrigatório')).toBeTruthy();
    expect(screen.getByLabelText('Nome')).toBeTruthy();
});

test('FormField prioriza campo e também funciona sem textos opcionais', async () => {
    const { queryByText } = await render(
        <FormField campo={<TextInput label="Email" value="" />}>
            <TextInput label="Ignorado" value="" />
        </FormField>
    );

    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(queryByText('Ignorado')).toBeNull();
});

test('TimeInput formata horário e permite remover', async () => {
    const alterar = jest.fn();
    const remover = jest.fn();
    await render(
        <TimeInput valor="12:30" onChangeText={alterar}
            podeRemover aoRemover={remover} />
    );

    await fireEvent.changeText(screen.getByLabelText('Horário'), '1845');
    await fireEvent.press(
        screen.getByRole('button', { name: 'Remover horário 12:30' })
    );

    expect(alterar).toHaveBeenCalledWith('18:45');
    expect(remover).toHaveBeenCalledTimes(1);
});
