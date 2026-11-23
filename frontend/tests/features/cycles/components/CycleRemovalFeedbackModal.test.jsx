import { fireEvent, screen } from '@testing-library/react-native';

import {
    CycleRemovalFeedbackModal,
    IconeAlerta
} from '../../../../src/features/cycles/components/CycleRemovalFeedbackModal';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    DropIcon: (props) =>
        require('react').createElement('DropIcon', { ...props, testID: 'gota-modal' })
}));

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
        backgroundColor: '#333333'
    });

    await render(<IconeAlerta erro />, { preferencia: 'escuro' });
    expect(screen.getByTestId('icone-alerta-erro')).toHaveStyle({
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'transparent'
    });
});

test('não renderiza tipo desconhecido', async () => {
    await render(<CycleRemovalFeedbackModal tipo="desconhecido" />);
    expect(screen.queryByRole('header')).toBeNull();
});

test('confirmacao noturna usa acao verde e cancelamento escuro sem inverter cores', async () => {
    await render(
        <CycleRemovalFeedbackModal tipo="confirmacao" periodo="07/08/2026 a 11/08/2026" />,
        { preferencia: 'escuro' }
    );
    expect(screen.getByRole('button', { name: 'Apagar' })).toHaveStyle({
        backgroundColor: '#A5D6A7'
    });
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveStyle({
        backgroundColor: '#242424',
        borderWidth: 1
    });
    expect(screen.getByText('Apagar')).toHaveStyle({ color: '#121212' });
    expect(screen.getByText('Cancelar')).toHaveStyle({ color: '#E3E3E3' });
    expect(screen.getByTestId('app-modal-caixa')).toHaveStyle({ backgroundColor: '#1E1E1E' });
});
test.each(['sucesso-excluir', 'sucesso-atualizar'])(
    'sucesso noturno %s mantem botao verde e icone de contorno',
    async (tipo) => {
        await render(<CycleRemovalFeedbackModal tipo={tipo} />, {
            preferencia: 'escuro'
        });
        expect(screen.getByRole('button', { name: 'OK' })).toHaveStyle({
            backgroundColor: '#A5D6A7'
        });
        expect(screen.getByTestId('icone-sucesso-ciclo')).toHaveStyle({
            backgroundColor: '#444444'
        });
        const icone = screen.getByTestId('gota-modal');
        expect(icone.props.weight).toBe('regular');
        expect(icone.props.color).toBe('#E3E3E3');
    }
);
