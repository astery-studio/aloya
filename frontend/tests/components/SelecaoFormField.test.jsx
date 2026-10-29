/**
 * Testes de seleção acessível e estrutura do FormField.
 */
import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import RadioOption from '../../src/shared/components/forms/RadioOption';
import FormField from '../../src/shared/components/forms/FormField';
import { renderWithTheme } from '../helpers/renderWithTheme';

test('opção única comunica seleção e executa a ação', async () => {
    const aoPressionar = jest.fn();
    await renderWithTheme(<RadioOption titulo="Diária" selecionado aoPressionar={aoPressionar} />);
    const opcao = screen.getByRole('radio', { name: 'Diária' });
    expect(opcao.props.accessibilityState.selected).toBe(true);
    fireEvent.press(opcao);
    expect(aoPressionar).toHaveBeenCalledTimes(1);
});

test('opção desativada não executa a ação', async () => {
    const aoPressionar = jest.fn();
    await renderWithTheme(<RadioOption titulo="Mensal" desativado aoPressionar={aoPressionar} />);
    fireEvent.press(screen.getByRole('radio', { name: 'Mensal' }));
    expect(aoPressionar).not.toHaveBeenCalled();
});

test('FormField mostra título, conteúdo e ajuda', async () => {
    await renderWithTheme(
        <FormField label="Dados Pessoais" tituloSecao mensagemAuxiliar="Texto auxiliar">
            <Text>Nome</Text>
        </FormField>
    );
    expect(screen.getByRole('header', { name: 'Dados Pessoais' })).toBeTruthy();
    expect(screen.getByText('Nome')).toBeTruthy();
    expect(screen.getByText('Texto auxiliar')).toBeTruthy();
});
