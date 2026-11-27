import { screen } from '@testing-library/react-native';

import { SupportedPersonIndicator } from '../../../../src/features/support-network/components/SupportedPersonIndicator/SupportedPersonIndicator';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('identifica a pessoa acompanhada em um indicador acessível e centralizado', async () => {
    const nome = 'Júlia Maria de Albuquerque e Silva';
    await render(<SupportedPersonIndicator nome={nome} />);

    expect(screen.getByLabelText(`Acompanhando ${nome}`)).toHaveStyle({ alignSelf: 'center' });
    expect(screen.getByText('Acompanhando')).toHaveStyle({ textTransform: 'uppercase' });
    expect(screen.getByText(nome)).toHaveStyle({ fontFamily: 'DMSans_700Bold' });
});

test('omite o indicador quando ainda não há uma pessoa acompanhada', async () => {
    await render(<SupportedPersonIndicator nome=" " />);

    expect(screen.queryByText('Acompanhando')).toBeNull();
});
