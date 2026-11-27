import { screen } from '@testing-library/react-native';

import { SupportedCycleHero } from '../../../../src/features/support-network/components/SupportedCycleHero/SupportedCycleHero';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('exibe a fase autorizada e omite a ilustração ao perder autorização', async () => {
    const props = { nomeTitular: 'Júlia', fase: 'folicular', possuiDadosCiclo: true, diaCiclo: 9 };
    const { rerender } = await render(<SupportedCycleHero {...props} exibirFase />);
    expect(screen.getByRole('header', { name: 'Fase Folicular' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Ilustração da fase folicular')).toBeOnTheScreen();
    expect(screen.getByText('Dia 9 do ciclo de Júlia')).toBeOnTheScreen();

    await rerender(<SupportedCycleHero {...props} />);
    expect(screen.queryByText('Fase Folicular')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('cycle-phase-artwork')).not.toBeOnTheScreen();
});

test('usa a ilustração neutra quando há permissão, mas ainda não há fase disponível', async () => {
    await render(<SupportedCycleHero nomeTitular="Júlia" exibirFase />);
    expect(screen.getByText('Acompanhe com carinho')).toBeOnTheScreen();
    expect(screen.getByTestId('supported-cycle-artwork-empty')).toBeOnTheScreen();
    expect(screen.queryByTestId('cycle-phase-artwork')).not.toBeOnTheScreen();
});
