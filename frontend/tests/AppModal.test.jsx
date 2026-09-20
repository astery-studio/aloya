import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import AppModal from '../components/feedback/Modal/AppModal';
import AlertModal from '../components/feedback/Modal/AlertModal';

function IconeTeste({ size, color }) {
    return <Text>ícone {size} {color}</Text>;
}

test('modal simples mostra ícone, título e mensagem', async () => {
    await render(<AppModal visivel icone={IconeTeste}
        titulo="Sucesso" mensagem="Tudo certo" />);
    expect(screen.getByText('ícone 22 #C85A44')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Sucesso' })).toBeTruthy();
    expect(screen.getByText('Tudo certo')).toBeTruthy();
});

test('AlertModal usa o cabeçalho vermelho criado pela base', async () => {
    await render(<AlertModal visivel icone={IconeTeste}
        titulo="Excluir conta?" mensagem="Ação permanente"
        destaque="Deseja continuar?">
        <Text>Área de ações</Text>
    </AlertModal>);
    expect(screen.getByText('ícone 26 #FFFFFF')).toBeTruthy();
    expect(screen.getByText('Deseja continuar?')).toBeTruthy();
    expect(screen.getByText('Área de ações')).toBeTruthy();
});

test('variante ação usa ícone de erro e aceita campo', async () => {
    await render(<AppModal visivel variante="acao" icone={IconeTeste}
        titulo="Confirme sua identidade">
        <Text>Campo de senha</Text>
    </AppModal>);
    expect(screen.getByText('ícone 22 #B43D3D')).toBeTruthy();
    expect(screen.getByText('Campo de senha')).toBeTruthy();
});

test('rejeita variante desconhecida', async () => {
    await expect(render(<AppModal visivel variante="inexistente"
        titulo="Teste" />)).rejects.toThrow('Variante de AppModal inválida');
});
