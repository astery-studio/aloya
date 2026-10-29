import { render, screen } from '@testing-library/react-native';

import { CycleParameterEditor } from '../../../../src/features/cycles/components/CycleParameterEditor';

test('reutiliza o sheet de edição com o campo numérico do ciclo', async () => {
    await render(
        <CycleParameterEditor
            visivel
            label="Duração do Ciclo"
            valor={28}
            valorOriginal={28}
            onAlterar={jest.fn()}
            onCancelar={jest.fn()}
            onSalvar={jest.fn()}
        />
    );

    expect(screen.getByText('Editar Duração do Ciclo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Duração do Ciclo')).toHaveProp('value', '28 dias');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
});
