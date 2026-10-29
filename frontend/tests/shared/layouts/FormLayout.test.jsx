import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import FormLayout from '../../../src/shared/layouts/FormLayout';
import { renderWithTheme } from '../../helpers/renderWithTheme';

test('renderiza cabeçalho, conteúdo e ações', async () => {
    await renderWithTheme(
        <FormLayout cabecalho={<Text>Cabeçalho</Text>} acoes={<Text>Ações</Text>} centralizado>
            <Text>Conteúdo</Text>
        </FormLayout>
    );

    expect(screen.getByText('Cabeçalho')).toBeTruthy();
    expect(screen.getByText('Conteúdo')).toBeTruthy();
    expect(screen.getByText('Ações')).toBeTruthy();
});

test('permite omitir regiões opcionais e personalizar o id', async () => {
    await renderWithTheme(
        <FormLayout testeId="formulario-sem-acoes">
            <Text>Conteúdo mínimo</Text>
        </FormLayout>
    );

    expect(screen.getByTestId('formulario-sem-acoes')).toBeTruthy();
    expect(screen.getByText('Conteúdo mínimo')).toBeTruthy();
    expect(screen.queryByText('Cabeçalho')).toBeNull();
    expect(screen.queryByText('Ações')).toBeNull();
});
