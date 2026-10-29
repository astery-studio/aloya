import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('../../../../src/features/cycles/components/CycleParameterField', () => {
    const { Pressable, Text } = require('react-native');
    return {
        CycleParameterField: ({ label, valor, onAlterar }) => (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={() => onAlterar(valor + 1)}
            >
                <Text>{`${label}: ${valor}`}</Text>
            </Pressable>
        )
    };
});

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen', () => {
    const { Pressable, Text } = require('react-native');
    return function ButtonMock({ texto, aoPressionar, desativado }) {
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={texto}
                disabled={desativado}
                onPress={aoPressionar}
                accessibilityState={{ disabled: desativado }}
            >
                <Text>{texto}</Text>
            </Pressable>
        );
    };
});

import { CycleParametersForm } from '../../../../src/features/cycles/components/CycleParametersForm';

const valores = {
    duracaoCicloInformada: 28,
    duracaoMenstruacaoInformada: 5,
    duracaoLuteaInformada: 14
};

test('apresenta os três campos e mantém salvar desabilitado', async () => {
    await render(<CycleParametersForm valores={valores} onAlterar={jest.fn()} />);

    expect(screen.getByText('Dados do Ciclo')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Duração do Ciclo' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Duração da Menstruação' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Duração da Fase Lútea' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
});

test('encaminha alterações e salvamento habilitado', async () => {
    const onAlterar = jest.fn();
    const onSalvar = jest.fn();
    await render(
        <CycleParametersForm
            valores={valores}
            onAlterar={onAlterar}
            onSalvar={onSalvar}
            podeSalvar
        />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Duração do Ciclo' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onAlterar).toHaveBeenCalledWith('duracaoCicloInformada', 29);
    expect(onSalvar).toHaveBeenCalledTimes(1);
});
