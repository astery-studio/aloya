/**
 * Testes das variantes, conteúdo e tema do AppModal.
 */
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import AppModal from '../../src/shared/components/feedback/Modal/AppModal';
import { ThemeProvider } from '../../src/shared/theme/ThemeProvider';

function IconeTeste({ size, color }) {
    return (
        <Text>
            ícone {size} {color}
        </Text>
    );
}

function renderizarModal(propriedades = {}, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <AppModal visivel titulo="Sucesso" {...propriedades} />
        </ThemeProvider>
    );
}

describe('AppModal', () => {
    test('modal simples mostra ícone, título e mensagem', async () => {
        await renderizarModal({
            icone: IconeTeste,
            mensagem: 'Tudo certo'
        });

        expect(screen.getByText('ícone 22 #C85A44')).toBeOnTheScreen();

        expect(
            screen.getByRole('header', {
                name: 'Sucesso'
            })
        ).toBeOnTheScreen();

        expect(screen.getByText('Tudo certo')).toBeOnTheScreen();
    });

    test('variante alerta usa cabeçalho de erro', async () => {
        await renderizarModal({
            variante: 'alerta',
            icone: IconeTeste,
            titulo: 'Excluir conta?',
            mensagem: 'Ação permanente',
            destaque: 'Deseja continuar?',
            children: <Text>Área de ações</Text>
        });

        expect(screen.getByText('ícone 26 #FFFFFF')).toBeOnTheScreen();

        expect(screen.getByText('Deseja continuar?')).toBeOnTheScreen();

        expect(screen.getByText('Área de ações')).toBeOnTheScreen();
    });

    test('variante ação usa ícone de erro', async () => {
        await renderizarModal({
            variante: 'acao',
            icone: IconeTeste,
            titulo: 'Confirme sua identidade',
            children: <Text>Campo de senha</Text>
        });

        expect(screen.getByText('ícone 22 #B43D3D')).toBeOnTheScreen();

        expect(screen.getByText('Campo de senha')).toBeOnTheScreen();
    });

    test('não renderiza quando invisível', async () => {
        await render(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <AppModal visivel={false} titulo="Oculto" />
            </ThemeProvider>
        );

        expect(screen.queryByText('Oculto')).toBeNull();
    });

    test('rejeita variante desconhecida', async () => {
        await expect(
            render(
                <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                    <AppModal visivel variante="inexistente" titulo="Teste" />
                </ThemeProvider>
            )
        ).rejects.toThrow('Variante de AppModal inválida');
    });

    test('usa superfície e textos claros', async () => {
        await renderizarModal({
            mensagem: 'Mensagem de teste'
        });

        expect(screen.getByTestId('app-modal-caixa')).toHaveStyle({
            backgroundColor: '#FFFFFF'
        });

        expect(screen.getByRole('header')).toHaveStyle({
            color: '#222222'
        });

        expect(screen.getByText('Mensagem de teste')).toHaveStyle({
            color: '#5C5C59'
        });
    });

    test('usa superfície e textos escuros', async () => {
        await renderizarModal(
            {
                mensagem: 'Mensagem de teste'
            },
            'escuro'
        );

        expect(screen.getByTestId('app-modal-caixa')).toHaveStyle({
            backgroundColor: '#2B322E'
        });

        expect(screen.getByRole('header')).toHaveStyle({
            color: '#F4F1EA'
        });

        expect(screen.getByText('Mensagem de teste')).toHaveStyle({
            color: '#C4C8C5'
        });
    });

    test('usa sobreposição correspondente ao tema', async () => {
        await renderizarModal({}, 'escuro');

        expect(screen.getByTestId('app-modal-fundo')).toHaveStyle({
            backgroundColor: 'rgba(0, 0, 0, 0.68)'
        });
    });

    test('expõe o término do fechamento nativo para transições entre modais', async () => {
        const aoOcultar = jest.fn();
        const resultado = await renderizarModal({ aoOcultar });
        const modal = resultado.container.queryAll(
            (elemento) => elemento.props.animationType === 'fade'
        )[0];

        modal.props.onDismiss();

        expect(aoOcultar).toHaveBeenCalledTimes(1);
    });
});
