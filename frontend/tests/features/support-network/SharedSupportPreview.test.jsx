import { fireEvent, screen } from '@testing-library/react-native';

import { SharedSupportPreview } from '../../../src/features/support-network/testing/SharedSupportPreview';
import { renderWithTheme as render } from '../../helpers/renderWithTheme';

jest.mock('expo-font', () => ({ useFonts: () => [true, null] }));

test('permite conferir os componentes já implementados com dados fictícios', async () => {
    await render(<SharedSupportPreview />);

    expect(screen.getByLabelText('Acompanhando Júlia')).toBeOnTheScreen();
    expect(screen.getByText('Entenda cada fase')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Ver Histórico de Ciclos' }));
    expect(screen.getByText('RESUMO DOS CICLOS DE JÚLIA')).toBeOnTheScreen();
    expect(screen.getAllByTestId('cycle-history-card')).toHaveLength(3);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Ver Diário' }));
    expect(screen.getByText('RESUMO DO DIÁRIO DE JÚLIA')).toBeOnTheScreen();
    expect(screen.getByText('Fase Folicular')).toBeOnTheScreen();
});
