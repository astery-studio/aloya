//Testa conteúdo, fechamento e ações do AlertModal.
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('phosphor-react-native/src/icons/WarningCircle', () => ({
    WarningCircleIcon: jest.fn(() => null)
}));

import AlertModal from '../components/feedback/Modal/AlertModal/AlertModal';

test('não mostra o conteúdo quando está oculto', async () => {
    await render(<AlertModal visivel={false} titulo="Erro" aoFechar={jest.fn()} />);

    expect(screen.queryByText('Erro')).toBeNull();
});

test('mostra título, mensagem e destaque', async () => {
    await render(
        <AlertModal
            visivel
            aoFechar={jest.fn()}
            titulo="Não foi possível salvar"
            mensagem="Confira os dados e tente novamente."
            destaque="Nenhuma alteração foi perdida."
        />
    );

    expect(screen.getByRole('header', { name: 'Não foi possível salvar' })).toBeOnTheScreen();
    expect(screen.getByText('Confira os dados e tente novamente.')).toBeOnTheScreen();
    expect(screen.getByText('Nenhuma alteração foi perdida.')).toBeOnTheScreen();
});

test('cria a ação Entendi quando recebe somente aoFechar', async () => {
    const aoFechar = jest.fn();

    await render(<AlertModal visivel aoFechar={aoFechar} titulo="Aviso" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Entendi' }));

    expect(aoFechar).toHaveBeenCalledTimes(1);
});

test('executa as ações principal e secundária separadamente', async () => {
    const principal = jest.fn();
    const secundaria = jest.fn();

    await render(
        <AlertModal
            visivel
            aoFechar={jest.fn()}
            titulo="Excluir informação?"
            acaoPrincipal={{ texto: 'Excluir', aoPressionar: principal }}
            acaoSecundaria={{ texto: 'Cancelar', aoPressionar: secundaria }}
        />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));

    expect(principal).toHaveBeenCalledTimes(1);
    expect(secundaria).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(secundaria).toHaveBeenCalledTimes(1);
});

test('bloqueia ação que está carregando', async () => {
    const aoPressionar = jest.fn();

    await render(
        <AlertModal
            visivel
            aoFechar={jest.fn()}
            titulo="Aguarde"
            acaoPrincipal={{ texto: 'Confirmar', aoPressionar, carregando: true }}
        />
    );

    const botao = screen.getByRole('button', { name: 'Confirmar' });

    await fireEvent.press(botao);

    expect(aoPressionar).not.toHaveBeenCalled();
    expect(botao).toBeDisabled();
    expect(botao.props.accessibilityState.busy).toBe(true);
});

test('rejeita modal visível sem ação ou fechamento', () => {
    expect(
        () => AlertModal({
            visivel: true,
            titulo: 'Alerta inválido'
        })
    ).toThrow(
        'AlertModal precisa de pelo menos uma ação'
    );
});