import { fireEvent, screen } from '@testing-library/react-native';

jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => ({
    BottomSheet: ({ visivel, children }) => (visivel ? children : null)
}));
jest.mock('../../../../src/shared/layouts/BottomSheet/BottomSheetLayout', () => ({
    BottomSheetLayout: ({ children }) => children
}));
jest.mock('../../../../src/shared/components/forms/DateInput/DateInput', () => {
    const { TextInput } = require('react-native');
    return function DateInputMock({ valor, onChangeText, rotuloAcessibilidade }) {
        return (
            <TextInput
                accessibilityLabel={rotuloAcessibilidade}
                value={valor}
                onChangeText={onChangeText}
            />
        );
    };
});
jest.mock('../../../../src/shared/components/common/Button/ButtonScreen/ButtonScreen', () => {
    const { Pressable } = require('react-native');
    return function ButtonScreenMock({ texto, aoPressionar, desativado }) {
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={texto}
                disabled={desativado}
                onPress={aoPressionar}
            />
        );
    };
});

import { CycleEditSheet } from '../../../../src/features/cycles/components/CycleEditSheet/CycleEditSheet';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

function criarProps(alteracoes = {}) {
    return {
        visivel: true,
        dataInicio: '01/10/2026',
        dataFim: '05/10/2026',
        alterado: false,
        salvando: false,
        onAlterarInicio: jest.fn(),
        onAlterarFim: jest.fn(),
        onFechar: jest.fn(),
        onSalvar: jest.fn(),
        ...alteracoes
    };
}

test('edita e limpa as datas do ciclo', async () => {
    const props = criarProps({ alterado: true });
    await render(<CycleEditSheet {...props} />);
    await fireEvent.changeText(screen.getByLabelText('Data de início do ciclo'), '02/10/2026');
    await fireEvent.changeText(screen.getByLabelText('Data de término do ciclo'), '');
    await fireEvent.press(screen.getByRole('button', { name: 'Limpar data de término' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(props.onAlterarInicio).toHaveBeenCalledWith('02/10/2026');
    expect(props.onAlterarFim).toHaveBeenCalledWith('');
    expect(props.onSalvar).toHaveBeenCalled();
});

test('oculta a limpeza e bloqueia salvamento sem alteração', async () => {
    await render(<CycleEditSheet {...criarProps({ dataFim: '', alterado: false })} />);
    expect(screen.queryByRole('button', { name: 'Limpar data de término' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
});

test('usa textos com contraste do tema escuro', async () => {
    await render(<CycleEditSheet {...criarProps()} />, { preferencia: 'escuro' });

    expect(screen.getByText('Data de Início')).toHaveStyle({ color: '#C4C8C5' });
    expect(screen.getByText('Deixe em branco se o ciclo ainda estiver em andamento.')).toHaveStyle({
        color: '#C4C8C5'
    });
});
