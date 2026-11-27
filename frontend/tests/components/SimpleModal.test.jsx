/**
 * Testes da composição e das ações oferecidas pelo SimpleModal.
 */
import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import SimpleModal from '../../src/shared/components/feedback/Modal/SimpleModal';
import { renderWithTheme } from '../helpers/renderWithTheme';

function IconeTeste() {
    return <Text>ícone</Text>;
}

test('modal oculto não mostra o conteúdo', async () => {
    await renderWithTheme(<SimpleModal visivel={false} titulo="Sucesso" />);
    expect(screen.queryByText('Sucesso')).toBeNull();
});

test('modal simples mostra ícone, mensagem e uma ação', async () => {
    const aoPressionar = jest.fn();
    await renderWithTheme(
        <SimpleModal
            visivel
            icone={IconeTeste}
            titulo="Senha redefinida com sucesso"
            mensagem="Faça login com sua nova senha."
            acaoPrincipal={{ texto: 'Fazer login', aoPressionar }}
        />
    );
    expect(screen.getByText('ícone')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Senha redefinida com sucesso' })).toBeTruthy();
    expect(screen.getByText('Faça login com sua nova senha.')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Fazer login' }));
    expect(aoPressionar).toHaveBeenCalledTimes(1);
});

test('modal aceita segunda ação sem disparar a primeira', async () => {
    const primeira = jest.fn();
    const segunda = jest.fn();
    await renderWithTheme(
        <SimpleModal
            visivel
            titulo="E-mail enviado"
            acaoPrincipal={{ texto: 'Entendi', aoPressionar: primeira }}
            acaoSecundaria={{ texto: 'Enviar novamente', aoPressionar: segunda }}
        />
    );
    fireEvent.press(screen.getByRole('button', { name: 'Enviar novamente' }));
    expect(segunda).toHaveBeenCalledTimes(1);
    expect(primeira).not.toHaveBeenCalled();
});

test('modal simples mantém texto legível no modo escuro', async () => {
    await renderWithTheme(
        <SimpleModal
            visivel
            titulo="Confirmação escura"
            mensagem="Mensagem visível"
            acaoPrincipal={{ texto: 'Entendi', aoPressionar: jest.fn() }}
        />,
        { preferencia: 'escuro' }
    );

    expect(screen.getByRole('header', { name: 'Confirmação escura' })).toHaveStyle({
        color: '#F4F1EA'
    });
    expect(screen.getByText('Mensagem visível')).toHaveStyle({ color: '#C4C8C5' });
});

test('aplica o padrão de erro interno sem alterar avisos comuns ou suas ações', async () => {
    const tentar = jest.fn();
    const voltar = jest.fn();
    const modal = (erroInterno) => (
        <SimpleModal
            visivel
            erroInterno={erroInterno}
            titulo="Falha ao salvar"
            acaoPrincipal={{ texto: 'Tentar novamente', aoPressionar: tentar }}
            acaoSecundaria={{ texto: 'Voltar', aoPressionar: voltar }}
        />
    );
    const { rerender } = await renderWithTheme(modal(true), { preferencia: 'escuro' });
    expect(screen.getByTestId('app-modal-caixa')).toHaveStyle({
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        boxShadow: '0 8px 40px 0 rgba(34, 34, 34, 0.12)'
    });
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveStyle({
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.38)'
    });
    expect(screen.getByRole('button', { name: 'Voltar' })).toHaveStyle({
        backgroundColor: '#242424'
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(tentar).toHaveBeenCalledTimes(1);
    expect(voltar).toHaveBeenCalledTimes(1);

    await rerender(modal(false));
    expect(screen.getByTestId('app-modal-caixa')).toHaveStyle({ backgroundColor: '#333333' });
});
