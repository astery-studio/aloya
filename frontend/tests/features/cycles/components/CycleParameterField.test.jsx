import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('../../../../src/features/settings/profile/ProfileField', () => {
    const { Pressable, Text } = require('react-native');
    return {
        ProfileField: ({ label, valor, onPress }) => (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Editar ${label}`}
                onPress={onPress}
            >
                <Text>{valor}</Text>
            </Pressable>
        )
    };
});
jest.mock('../../../../src/features/cycles/components/CycleParameterEditor', () => {
    const { Pressable, Text } = require('react-native');
    return {
        CycleParameterEditor: ({ visivel, label, onAlterar, onCancelar, onSalvar }) =>
            visivel ? (
                <>
                    <Text>{`Editor: ${label}`}</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Alterar valor"
                        onPress={() => onAlterar(30)}
                    />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cancelar edição"
                        onPress={onCancelar}
                    />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Salvar edição"
                        onPress={onSalvar}
                    />
                </>
            ) : null
    };
});

import { CycleParameterField } from '../../../../src/features/cycles/components/CycleParameterField';

test('usa a linha de perfil e abre o editor do parâmetro', async () => {
    const onAlterar = jest.fn();
    await render(<CycleParameterField label="Duração do Ciclo" valor={28} onAlterar={onAlterar} />);

    expect(screen.getByText('28 dias')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Editar Duração do Ciclo' }));
    expect(screen.getByText('Editor: Duração do Ciclo')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar valor' }));
    expect(onAlterar).toHaveBeenCalledWith(30);
});

test('restaura o valor original ao cancelar a edição', async () => {
    const onAlterar = jest.fn();
    await render(<CycleParameterField label="Duração do Ciclo" valor={28} onAlterar={onAlterar} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Editar Duração do Ciclo' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar edição' }));
    expect(onAlterar).toHaveBeenLastCalledWith(28);
});

test('fecha o editor ao salvar e apresenta valor inválido com erro', async () => {
    await render(
        <CycleParameterField label="Duração" valor={null} erro="Campo inválido" onAlterar={jest.fn()} />
    );
    expect(screen.getByText('Informe a duração')).toBeOnTheScreen();
    expect(screen.getByRole('alert')).toHaveTextContent('Campo inválido');
    await fireEvent.press(screen.getByRole('button', { name: 'Editar Duração' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar edição' }));
    expect(screen.queryByText('Editor: Duração')).toBeNull();
});
