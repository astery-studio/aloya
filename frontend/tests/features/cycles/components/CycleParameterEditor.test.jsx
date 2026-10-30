import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CycleParameterEditor } from '../../../../src/features/cycles/components/CycleParameterEditor';

test('reutiliza o sheet de edição com o campo numérico do ciclo', async () => {
    await render(
        <SafeAreaProvider
            initialMetrics={{
                frame: { x: 0, y: 0, width: 390, height: 844 },
                insets: { top: 0, right: 0, bottom: 32, left: 0 }
            }}
        >
            <CycleParameterEditor
                visivel
                label="Duração do Ciclo"
                valor={28}
                valorOriginal={28}
                onAlterar={jest.fn()}
                onCancelar={jest.fn()}
                onSalvar={jest.fn()}
            />
        </SafeAreaProvider>
    );

    expect(screen.getByText('Editar Duração do Ciclo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Duração do Ciclo')).toHaveProp('value', '28');
    expect(screen.getByText('dias')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
});
