/**
 * Testes da estrutura, retorno e conteúdo apresentados pelo AuthLayout.
 */
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import AuthLayout from '../layouts/AuthLayout';

test('organiza título, descrição, formulário e rodapé', async () => {
    await render(
        <AuthLayout
            titulo="Entrar"
            descricao="Acesse sua conta"
            rodape={<Text>Criar conta</Text>}
        >
            <Text>Campos de autenticação</Text>
        </AuthLayout>
    );

    expect(screen.getByRole('header', { name: 'Entrar' })).toBeTruthy();
    expect(screen.getByText('Acesse sua conta')).toBeTruthy();
    expect(screen.getByText('Campos de autenticação')).toBeTruthy();
    expect(screen.getByText('Criar conta')).toBeTruthy();
});

test('permite omitir descrição e rodapé', async () => {
    await render(<AuthLayout titulo="Recuperar senha"><Text>E-mail</Text></AuthLayout>);
    expect(screen.getByTestId('auth-layout')).toBeTruthy();
    expect(screen.queryByText('Acesse sua conta')).toBeNull();
    expect(screen.getByText('E-mail')).toBeTruthy();
});
