import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import SimpleModal from '../../components/feedback/Modal/SimpleModal';

function IconeTeste() {
    return <Text>ícone</Text>;
}

test('modal oculto não mostra o conteúdo', async () => {
    await render(<SimpleModal visivel={false} titulo="Sucesso" />);
    expect(screen.queryByText('Sucesso')).toBeNull();
});

test('modal simples mostra ícone, mensagem e uma ação', async () => {
    const aoPressionar = jest.fn();
    await render(
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
    await render(
        <SimpleModal visivel titulo="E-mail enviado"
            acaoPrincipal={{ texto: 'Entendi', aoPressionar: primeira }}
            acaoSecundaria={{ texto: 'Enviar novamente', aoPressionar: segunda }}
        />
    );
    fireEvent.press(screen.getByRole('button', { name: 'Enviar novamente' }));
    expect(segunda).toHaveBeenCalledTimes(1);
    expect(primeira).not.toHaveBeenCalled();
});
