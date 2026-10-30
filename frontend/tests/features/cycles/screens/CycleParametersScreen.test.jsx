import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

jest.mock(
    '../../../../src/features/settings/layouts/SettingsLayout/SettingsLayout',
    () => require('./CycleParametersScreen.mocks').settingsLayoutModule
);
jest.mock(
    '../../../../src/features/cycles/components/CycleParametersStateView',
    () => require('./CycleParametersScreen.mocks').stateViewModule
);
jest.mock(
    '../../../../src/features/cycles/components/CycleParametersFeedback',
    () => require('./CycleParametersScreen.mocks').feedbackModule
);
jest.mock(
    '../../../../src/features/cycles/components/CycleParametersForm',
    () => require('./CycleParametersScreen.mocks').formModule
);

import { CycleParametersScreen } from '../../../../src/features/cycles/screens/CycleParametersScreen';

const parametros = {
    duracaoCicloInformada: 28,
    duracaoMenstruacaoInformada: 5,
    duracaoLuteaInformada: 14
};

test('carrega, habilita alteração real e apresenta sucesso', async () => {
    const service = {
        buscar: jest.fn().mockResolvedValue(parametros),
        atualizar: jest.fn().mockImplementation(async (dados) => dados)
    };
    await render(<CycleParametersScreen service={service} />);

    await screen.findByText('Ciclo: 28');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar ciclo' }));
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() =>
        expect(service.atualizar).toHaveBeenCalledWith({
            ...parametros,
            duracaoCicloInformada: 30
        })
    );
    expect(await screen.findByText('Sucesso')).toBeOnTheScreen();
});
