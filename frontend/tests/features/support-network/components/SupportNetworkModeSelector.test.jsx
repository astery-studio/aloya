import { fireEvent, screen } from '@testing-library/react-native';

import { SupportNetworkModeSelector } from '../../../../src/features/support-network/components/SupportNetworkModeSelector/SupportNetworkModeSelector';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

describe('SupportNetworkModeSelector', () => {
    test('apresenta as duas opções e destaca o fluxo atual', async () => {
        await render(<SupportNetworkModeSelector selecionado="apoio" aoSelecionar={jest.fn()} />);

        expect(
            screen.getByRole('tab', { name: 'Contatos de Apoio' }).props.accessibilityState.selected
        ).toBe(true);
        expect(
            screen.getByRole('tab', { name: 'Contatos Acompanhados' }).props.accessibilityState
                .selected
        ).toBe(false);
    });

    test('alterna para o fluxo acompanhado', async () => {
        const aoSelecionar = jest.fn();
        await render(
            <SupportNetworkModeSelector selecionado="apoio" aoSelecionar={aoSelecionar} />
        );

        await fireEvent.press(screen.getByRole('tab', { name: 'Contatos Acompanhados' }));

        expect(aoSelecionar).toHaveBeenCalledWith('acompanhados');
        expect(aoSelecionar).toHaveBeenCalledTimes(1);
    });
});
