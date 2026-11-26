import { fireEvent, screen } from '@testing-library/react-native';
import { NoCycleDiarySection } from '../../../../src/features/cycles/components/home/NoCycleDiarySection';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

test('abre o Diário e a anotação por ações distintas na Home sem ciclo', async () => {
    const aoAbrirDiario = jest.fn();
    const aoAbrirReflexao = jest.fn();

    await renderWithTheme(
        <NoCycleDiarySection aoAbrirDiario={aoAbrirDiario} aoAbrirReflexao={aoAbrirReflexao} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Como você está se sentindo?' }));
    expect(aoAbrirDiario).toHaveBeenCalledTimes(1);
    expect(aoAbrirReflexao).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Gostaria de fazer uma anotação?' }));
    expect(aoAbrirReflexao).toHaveBeenCalledTimes(1);
});
