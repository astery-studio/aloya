import { fireEvent, render, screen } from '@testing-library/react-native';

import { CycleParametersStateView } from '../../../../src/features/cycles/components/CycleParametersStateView';

test('apresenta o carregamento dos parâmetros', async () => {
    await render(<CycleParametersStateView carregando />);
    expect(screen.getByText('Carregando parâmetros do ciclo...')).toBeOnTheScreen();
    expect(screen.queryByRole('alert')).toBeNull();
});

test('apresenta a falha e permite tentar novamente', async () => {
    const onTentarNovamente = jest.fn();
    await render(<CycleParametersStateView carregando={false} onTentarNovamente={onTentarNovamente} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado');
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onTentarNovamente).toHaveBeenCalledTimes(1);
});
