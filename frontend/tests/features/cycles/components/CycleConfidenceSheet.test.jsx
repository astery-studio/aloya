import { fireEvent, screen } from '@testing-library/react-native';

import { CycleConfidenceSheet } from '../../../../src/features/cycles/components/sheets/CycleConfidenceSheet';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => ({
    BottomSheet: ({ children, visivel }) => (visivel ? children : null)
}));

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    ChartLineUpIcon: jest.fn(() => null)
}));

describe('CycleConfidenceSheet', () => {
    test('explica o nível atual de confiabilidade', async () => {
        await render(<CycleConfidenceSheet visivel nivel="alta" aoFechar={jest.fn()} />);

        expect(screen.getByRole('header', { name: 'O que isso significa?' })).toBeOnTheScreen();
        expect(screen.getByLabelText('Nível atual: alta')).toBeOnTheScreen();
        expect(screen.getByText(/dados suficientes e consistentes/)).toBeOnTheScreen();
        expect(screen.getByRole('button', { name: 'Alta' })).toBeSelected();
    });

    test('permite consultar a explicação de outro nível', async () => {
        await render(<CycleConfidenceSheet visivel nivel="baixa" aoFechar={jest.fn()} />);

        await fireEvent.press(screen.getByRole('button', { name: 'Média' }));

        expect(screen.getByText('Confiabilidade média')).toBeOnTheScreen();
        expect(screen.getByText(/variações recentes podem alterar/)).toBeOnTheScreen();
        expect(screen.getByLabelText('Nível atual: média')).toBeOnTheScreen();
        expect(screen.getByRole('button', { name: 'Média' })).toBeSelected();
    });

    test('usa baixa como nível seguro quando recebe valor desconhecido', async () => {
        await render(<CycleConfidenceSheet visivel nivel="desconhecido" aoFechar={jest.fn()} />);

        expect(screen.getByText('Confiabilidade baixa')).toBeOnTheScreen();
        expect(screen.getByLabelText('Nível atual: baixa')).toBeOnTheScreen();
    });

    test('não apresenta o conteúdo enquanto está fechado', async () => {
        await render(<CycleConfidenceSheet visivel={false} nivel="alta" aoFechar={jest.fn()} />);

        expect(screen.queryByRole('header', { name: 'O que isso significa?' })).toBeNull();
    });
});
