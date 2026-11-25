import { fireEvent, screen } from '@testing-library/react-native';
import { BookOpenIcon } from 'phosphor-react-native/src/icons/BookOpen';
import { NoCycleTrackingSection } from '../../../../src/features/cycles/components/home/NoCycleTrackingSection';
import { RECURSOS_SEM_CICLO } from '../../../../src/features/cycles/constants/noCycleTrackingContent';
import {
    CalendarBlankIcon,
    PillIcon,
    SparkleIcon
} from '../../../../src/shared/components/icons/AppIcons';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('mantém expansões independentes e abre anticoncepcionais', async () => {
    const aoAlternar = jest.fn();
    const aoAbrir = jest.fn();
    await render(
        <NoCycleTrackingSection
            idsExpandidos={new Set(['anticoncepcional'])}
            aoAlternar={aoAlternar}
            aoAbrirAnticoncepcional={aoAbrir}
        />
    );

    expect(screen.getByText(/Organize seus registros/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: /Entenda o ritmo/ }));
    expect(aoAlternar).toHaveBeenCalledWith('ritmo');
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir Anticoncepcionais' }));
    expect(aoAbrir).toHaveBeenCalledTimes(1);
});

test('associa os ícones importados do protótipo aos quatro cartões', () => {
    expect(RECURSOS_SEM_CICLO.map(({ id, Icone }) => [id, Icone])).toEqual([
        ['ritmo', CalendarBlankIcon],
        ['fertilidade', SparkleIcon],
        ['sentimentos', BookOpenIcon],
        ['anticoncepcional', PillIcon]
    ]);
});

test.each([undefined, [], ['ritmo']])(
    'aceita a seleção de cartões como lista (%#)',
    async (idsExpandidos) => {
        await render(<NoCycleTrackingSection idsExpandidos={idsExpandidos} />);
        const ritmo = screen.getByRole('button', { name: /Entenda o ritmo/ });

        expect(ritmo.props.accessibilityState.expanded).toBe(Boolean(idsExpandidos?.length));
    }
);
