import { fireEvent, render, screen } from '@testing-library/react-native';

let mockParametros;

jest.mock('../../../../src/features/cycles/hooks/useCycleParameters', () => ({
    useCycleParameters: () => mockParametros
}));
jest.mock('../../../../src/features/settings/layouts/SettingsLayout/SettingsLayout', () => {
    const { Pressable, Text } = require('react-native');
    return { SettingsLayout: ({ children, onVoltar }) => <><Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onVoltar} /><Text>Tela</Text>{children}</> };
});
jest.mock('../../../../src/features/cycles/components/CycleParametersStateView', () => ({
    CycleParametersStateView: () => null
}));
jest.mock('../../../../src/features/cycles/components/CycleParametersForm', () => ({
    CycleParametersForm: () => null
}));
jest.mock('../../../../src/features/cycles/components/CycleParametersFeedback', () => {
    const { Pressable, Text } = require('react-native');
    return {
        CycleParametersFeedback: ({ saidaSemSalvar, onContinuarEditando, onSairSemSalvar }) => saidaSemSalvar ? (
            <>
                <Text>Saída pendente</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Continuar" onPress={onContinuarEditando} />
                <Pressable accessibilityRole="button" accessibilityLabel="Sair" onPress={onSairSemSalvar} />
            </>
        ) : null
    };
});

import { CycleParametersScreen } from '../../../../src/features/cycles/screens/CycleParametersScreen';

function estado(alteracoes = {}) {
    return {
        salvando: false, alterado: false, carregando: false, erroCarregamento: false,
        valores: {}, erros: {}, podeSalvar: false, sucesso: false, erroSalvar: null,
        tentarNovamente: jest.fn(), alterar: jest.fn(), salvar: jest.fn(),
        fecharSucesso: jest.fn(), fecharErro: jest.fn(), ...alteracoes
    };
}

test('volta diretamente quando não há alteração', async () => {
    const onVoltar = jest.fn();
    mockParametros = estado();
    await render(<CycleParametersScreen onVoltar={onVoltar} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(onVoltar).toHaveBeenCalled();
});

test('confirma descarte e permite continuar quando há alteração', async () => {
    const onVoltar = jest.fn();
    mockParametros = estado({ alterado: true });
    await render(<CycleParametersScreen onVoltar={onVoltar} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByText('Saída pendente')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.queryByText('Saída pendente')).toBeNull();
});

test('bloqueia a saída durante o salvamento', async () => {
    const onVoltar = jest.fn();
    mockParametros = estado({ salvando: true });
    await render(<CycleParametersScreen onVoltar={onVoltar} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(onVoltar).not.toHaveBeenCalled();
});
