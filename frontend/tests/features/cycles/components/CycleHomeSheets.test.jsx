import { fireEvent, screen } from '@testing-library/react-native';
import { CycleConfidenceSheet } from '../../../../src/features/cycles/components/sheets/CycleConfidenceSheet';
import { CyclePhaseEducationSheet } from '../../../../src/features/cycles/components/sheets/CyclePhaseEducationSheet';
import { DiaryReflectionSheet } from '../../../../src/features/cycles/components/sheets/DiaryReflectionSheet';
import { GuidedBreathingSheet } from '../../../../src/features/cycles/components/sheets/GuidedBreathingSheet';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => ({
    BottomSheet: ({ children, visivel }) => (visivel ? children : null)
}));

jest.mock('../../../../src/shared/layouts/BottomSheet/BottomSheetLayout', () => {
    const { Text, View } = require('react-native');
    return {
        BottomSheetLayout: ({ children, titulo }) => (
            <View>
                <Text accessibilityRole="header">{titulo}</Text>
                {children}
            </View>
        )
    };
});

test('explica o nível atual de confiabilidade', async () => {
    await render(<CycleConfidenceSheet visivel nivel="alta" aoFechar={jest.fn()} />);

    expect(screen.getByRole('header', { name: 'O que isso significa?' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Nível atual: alta')).toBeOnTheScreen();
    expect(screen.getByText(/dados suficientes e consistentes/)).toBeOnTheScreen();
});

test('apresenta a educação da fase em sheet próprio', async () => {
    await render(<CyclePhaseEducationSheet visivel fase="folicular" aoFechar={jest.fn()} />);

    expect(screen.getByRole('header', { name: 'Fase Folicular' })).toBeOnTheScreen();
    expect(screen.getByText(/níveis hormonais começam a subir/)).toBeOnTheScreen();
});

test('habilita a reflexão preenchida e delega o salvamento', async () => {
    const aoSalvar = jest.fn();
    await render(
        <DiaryReflectionSheet
            visivel
            valor="Preciso descansar"
            aoAlterar={jest.fn()}
            aoSalvar={aoSalvar}
            aoFechar={jest.fn()}
        />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Salvar no Diário' }));
    expect(aoSalvar).toHaveBeenCalledTimes(1);
});

test('mantém instrução textual quando o movimento é reduzido', async () => {
    await render(<GuidedBreathingSheet visivel movimentoReduzido aoFechar={jest.fn()} />);

    expect(screen.getByText('Inspire e expire devagar, no seu ritmo.')).toBeOnTheScreen();
});
