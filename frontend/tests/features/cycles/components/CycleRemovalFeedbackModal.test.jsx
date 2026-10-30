import { fireEvent, screen } from '@testing-library/react-native';

import {
    CycleRemovalFeedbackModal,
    IconeAlerta
} from '../../../../src/features/cycles/components/CycleRemovalFeedbackModal';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('confirma exclusão com textos e ações idênticos ao protótipo', async () => {
    const onConfirmar = jest.fn();
    const onCancelar = jest.fn();

    await render(
        <CycleRemovalFeedbackModal
            tipo="confirmacao"
            periodo="07/08/2026 a 11/08/2026"
            onConfirmar={onConfirmar}
            onCancelar={onCancelar}
        />
    );

    expect(screen.getByRole('header', { name: 'Apagar ciclo' })).toBeOnTheScreen();
    expect(
        screen.getByText(
            'Tem certeza que deseja excluir todo o período de menstruação de 07/08/2026 a 11/08/2026 do seu histórico? Esta ação não pode ser desfeita e recalculará suas previsões futuras.'
        )
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Apagar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onConfirmar).toHaveBeenCalledTimes(1);
    expect(onCancelar).toHaveBeenCalledTimes(1);
});

test('apresenta erro com quebra de linha e ações do protótipo', async () => {
    const onTentarNovamente = jest.fn();
    const onFechar = jest.fn();

    await render(
        <CycleRemovalFeedbackModal
            tipo="erro"
            onTentarNovamente={onTentarNovamente}
            onFechar={onFechar}
        />
    );

    expect(screen.getByRole('header', { name: 'Algo deu errado' })).toBeOnTheScreen();
    expect(
        screen.getByText('Ocorreu um erro ao excluir este registro.\nTente novamente.')
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(onTentarNovamente).toHaveBeenCalledTimes(1);
    expect(onFechar).toHaveBeenCalledTimes(1);
});

test('bloqueia fechamento e ações do alerta de erro durante a tentativa', async () => {
    await render(
        <CycleRemovalFeedbackModal
            tipo="erro"
            carregando
            onFechar={jest.fn()}
            onTentarNovamente={jest.fn()}
        />
    );

    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeDisabled();
});

test.each([
    ['sucesso-excluir', 'Ciclo excluído com sucesso'],
    ['sucesso-atualizar', 'Ciclo atualizado com sucesso']
])('apresenta %s sem texto adicional', async (tipo, titulo) => {
    const onFechar = jest.fn();

    await render(<CycleRemovalFeedbackModal tipo={tipo} onFechar={onFechar} />);

    expect(screen.getByRole('header', { name: titulo })).toBeOnTheScreen();
    expect(screen.queryByText('Registro de menstruação excluído com sucesso.')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(onFechar).toHaveBeenCalledTimes(1);
});

test('bloqueia confirmação e cancelamento durante a exclusão', async () => {
    await render(
        <CycleRemovalFeedbackModal
            tipo="confirmacao"
            periodo="07/08/2026 a 11/08/2026"
            carregando
        />
    );

    expect(screen.getByRole('button', { name: 'Apagar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
});

test('usa área quadrada de 48 por 48 e diferencia as cores do alerta', async () => {
    await render(<IconeAlerta />, { preferencia: 'escuro' });
    expect(screen.getByTestId('icone-alerta-confirmacao')).toHaveStyle({
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#4A3737'
    });

    await render(<IconeAlerta erro />, { preferencia: 'escuro' });
    expect(screen.getByTestId('icone-alerta-erro')).toHaveStyle({
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#343434'
    });
});

test('não renderiza tipo desconhecido', async () => {
    await render(<CycleRemovalFeedbackModal tipo="desconhecido" />);
    expect(screen.queryByRole('header')).toBeNull();
});
