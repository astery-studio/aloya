import { screen } from '@testing-library/react-native';
import { CycleEducationalDisclaimer } from '../../../../src/features/cycles/components/home/CycleEducationalDisclaimer';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test.each(['educativa', 'contraceptiva'])(
    'apresenta aviso %s como informação',
    async (variante) => {
        await render(<CycleEducationalDisclaimer texto="Conteúdo educativo" variante={variante} />);

        expect(screen.getByLabelText('Conteúdo educativo')).toBeOnTheScreen();
        expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
    }
);
